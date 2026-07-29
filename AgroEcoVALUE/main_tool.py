
# -*- coding: utf-8 -*-
import arcpy
from datetime import datetime
from time import time
import re
from eco_score_enum import (
    CorridorScoreType, NaturalAreaType, DynamicScore,
    OpenSpaceCorridorType, CoverType, VegLine,
    WaterType, spatialScaleScores, TopoLine
)

# -------------------------------
# PARAMETERS FROM TOOL
# -------------------------------
agricultural_layer = arcpy.GetParameterAsText(0)

corridor_layer = arcpy.GetParameterAsText(1)
corridor_score_field = arcpy.GetParameterAsText(2)
ecological_units_layer = arcpy.GetParameterAsText(3)
ecological_units_score_field = arcpy.GetParameterAsText(4)

floodplain_layer = arcpy.GetParameterAsText(5)
floodplain_score_field = arcpy.GetParameterAsText(6)
max_distance = arcpy.GetParameterAsText(7)
landscape_units_layer = arcpy.GetParameterAsText(8)
NaturalArea_score_field = arcpy.GetParameterAsText(9)
rezef_score_layer = arcpy.GetParameterAsText(10)
rezef_score_field = arcpy.GetParameterAsText(11)

covertype_score_field = arcpy.GetParameterAsText(12)
watertype_score_field = arcpy.GetParameterAsText(13)


terraces_layer = arcpy.GetParameterAsText(14)
terraces_score_field = arcpy.GetParameterAsText(15)
vegline_layer = arcpy.GetParameterAsText(16)
vegline_score_field = arcpy.GetParameterAsText(17)

drainage_channels_layer = arcpy.GetParameterAsText(18)
drainage_channels_score_field = arcpy.GetParameterAsText(19)



# -------------------------------
# VALIDATION: Agricultural layer is mandatory
# -------------------------------
if not agricultural_layer:
    arcpy.AddError("Agricultural parcels layer is required.")
    raise arcpy.ExecuteError

# Check required fields in agricultural layer
required_fields = ["LandCov", "CoverType", "WaterType"]
for field in required_fields:
    if field not in [f.name for f in arcpy.ListFields(agricultural_layer)]:
        arcpy.AddError(f"Required field '{field}' not found in agricultural layer.")
        raise arcpy.ExecuteError

# -------------------------------
# GLOBAL WARNING DICTIONARY
# -------------------------------
warnings_by_oid = {}

def add_warning(oid, message, display_alert):
    """Add a warning message for a parcel and emit ArcPy warning."""
    if display_alert:
        arcpy.AddWarning(message)
    warnings_by_oid.setdefault(oid, []).append(message)

# -------------------------------
# Weighted Scoring Setup
# -------------------------------
categories = {
    "NATIONAL": {
        "fields": [corridor_score_field, ecological_units_score_field],
        "total_max_score": spatialScaleScores.NATIONAL.value
    },
    "Agricultural_Landscape_Unit": {
        "fields": [floodplain_score_field, NaturalArea_score_field, rezef_score_field],
        "total_max_score": spatialScaleScores.Agricultural_Landscape_Unit.value
    },
    "Natural_Features": {
        "fields": [vegline_score_field, terraces_score_field, drainage_channels_score_field],
        "total_max_score": spatialScaleScores.Natural_Features.value
    },
    "Agricultural_Features": {
        "fields": [covertype_score_field, watertype_score_field],
        "total_max_score": spatialScaleScores.Agricultural_Features.value
    },
}

# Calculate per-metric score for each category
category_max_scores = {}

arcpy.AddMessage("========== Weighted Scoring Table ==========")
arcpy.AddMessage("{:<35} {:>12} {:>20}".format("Index", "Max Score", "Sub-Index Score"))
arcpy.AddMessage("-" * 70)

for category, info in categories.items():
    active_fields = [f for f in info["fields"] if f]
    if active_fields:
        per_metric_score = info["total_max_score"] / len(active_fields)
    else:
        per_metric_score = 0
    category_max_scores[category] = per_metric_score

    # Print row with proper spacing
    arcpy.AddMessage("{:<35} {:>12} {:>20.2f}".format(category, info["total_max_score"], per_metric_score))

arcpy.AddMessage("-" * 70)



# -------------------------------
# Add fields only if active
# -------------------------------
for category, info in categories.items():
    for field_name in info["fields"]:
        if field_name and field_name not in [f.name for f in arcpy.ListFields(agricultural_layer)]:
            arcpy.AddField_management(agricultural_layer, field_name, "DOUBLE")

# Add WARNING field if needed
if 'WARNING' not in [f.name for f in arcpy.ListFields(agricultural_layer)]:
    arcpy.AddField_management(agricultural_layer, 'WARNING', 'TEXT', field_length=2000)

# Add SUM field if needed
if 'SUM' not in [f.name for f in arcpy.ListFields(agricultural_layer)]:
    arcpy.AddField_management(agricultural_layer, 'SUM', 'DOUBLE')

# -------------------------------
# FUNCTIONS
# -------------------------------
def calculate_corridor_scores():
    """Calculate corridor scores based on ECO layer and apply weighted scoring using category_max_scores."""
    start_time = time()
    try:
        # Pre-load all ECO features once
        eco_list = []
        with arcpy.da.SearchCursor(corridor_layer, ["SHAPE@", "TypeRTGyosh"]) as eco_cursor:
            for eco_geom, eco_type in eco_cursor:
                eco_list.append((eco_geom, eco_type))

        # Get total parcel count for progressor
        parcel_count = int(arcpy.GetCount_management(agricultural_layer).getOutput(0))
        arcpy.SetProgressor("step", "Processing parcels for corridor scores...", 0, parcel_count, 1)

        # Get per-metric score for NATIONAL category from pre-calculated dictionary
        per_metric_score = category_max_scores.get("NATIONAL", 0)

        with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "SHAPE@", corridor_score_field]) as parcels:
            for i, (oid, geom, _) in enumerate(parcels):
                # Default factor is NONE (0.0)
                base_factor = DynamicScore.NONE.value
                
                # Search ECO list for matching geometry
                for eco_geom, eco_type in eco_list:
                    if eco_geom.contains(geom):
                        # Assign factor based on corridor type
                        if any(re.search(str(pattern), str(eco_type)) for pattern in CorridorScoreType.CORE.value):
                            base_factor = DynamicScore.MAXIMUM.value
                        elif any(re.search(str(pattern), str(eco_type)) for pattern in CorridorScoreType.TRANSITION.value):
                            base_factor = DynamicScore.MEDIUM.value
                        elif any(re.search(str(pattern), str(eco_type)) for pattern in CorridorScoreType.CORRIDOR.value):
                            base_factor = DynamicScore.LOW.value
                        else:
                            add_warning(oid, f"CorridorScoreType: eco_type '{eco_type}'. Assigned 0 score.", True)
                        break

                # Multiply factor by per-metric score
                final_score = base_factor * per_metric_score

                # Update row with calculated score
                parcels.updateRow([oid, geom, final_score])
                arcpy.SetProgressorPosition(i + 1)

        elapsed = time() - start_time
        arcpy.AddMessage(f"Corridor scores saved in '{corridor_score_field}'. Time: {elapsed:.2f}s")
    except Exception as e:
        arcpy.AddError(f"Failed to calculate corridor scores: {e}")

def calculate_floodplain_scores():
    """Calculate floodplain scores using weighted logic."""
    start_time = time()
    try:
        # Pre-load all floodplain features once
        floodplain_list = []
        with arcpy.da.SearchCursor(floodplain_layer, ["SHAPE@"]) as flood_cursor:
            for (flood_geom,) in flood_cursor:
                floodplain_list.append(flood_geom)

        arcpy.SetProgressorLabel("Analyzing floodplain overlaps...")
        overlap_threshold = 0.2
        parcel_count = int(arcpy.GetCount_management(agricultural_layer).getOutput(0))
        arcpy.SetProgressor("step", "Processing parcels for floodplain scores...", 0, parcel_count, 1)

        # Get per-metric score for Agricultural_Landscape_Unit category
        per_metric_score = category_max_scores.get("Agricultural_Landscape_Unit", 0)

        with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "SHAPE@", floodplain_score_field]) as parcels:
            for i, (oid, geom, _) in enumerate(parcels):
                min_distance = None
                max_overlap_ratio = 0.0

                for flood_geom in floodplain_list:
                    distance = geom.distanceTo(flood_geom)
                    
                    if min_distance is None or distance < min_distance:
                        min_distance = distance

                    if distance == 0:
                        intersection = geom.intersect(flood_geom, 4)
                        if intersection.area > 0:
                            overlap_ratio = intersection.area / geom.area
                            max_overlap_ratio = max(max_overlap_ratio, overlap_ratio)

                # Determine factor based on overlap and distance
                if max_overlap_ratio >= overlap_threshold:
                    factor = DynamicScore.MAXIMUM.value
                    if max_overlap_ratio < 0.2:
                        add_warning(oid, f"FloodplainScore: max overlap = {max_overlap_ratio:.2%}", True)
                elif min_distance is not None and float(max_distance) and min_distance <= float(max_distance):
                    factor = DynamicScore.MEDIUM.value
                else:
                    factor = DynamicScore.NONE.value

                final_score = factor * per_metric_score
                parcels.updateRow([oid, geom, final_score])
                arcpy.SetProgressorPosition(i + 1)

        elapsed = time() - start_time
        arcpy.AddMessage(f"Floodplain scores saved in '{floodplain_score_field}'. Time: {elapsed:.2f}s")
    except Exception as e:
        arcpy.AddError(f"Error calculating floodplain scores: {e}")

def calculate_natural_area_scores():
    """Calculate natural area scores using weighted logic."""
    start_time = time()
    try:
        unit_list = []
        # Pre-calculate scores for each landscape unit
        with arcpy.da.SearchCursor(landscape_units_layer, ["SHAPE@"]) as eco_cursor:
            for eco_geom in eco_cursor:
                sum_open_area = 0.0
                sum_total_area = 0.0
                with arcpy.da.SearchCursor(agricultural_layer, ["SHAPE@", "LandCov"]) as parcel_cursor:
                    for geom, landcov in parcel_cursor:
                        if geom.overlaps(eco_geom[0]) or geom.within(eco_geom[0]) or eco_geom[0].within(geom):
                            if re.search(NaturalAreaType.OPEN.value[1], landcov) or re.search(NaturalAreaType.OPEN.value[0], landcov):
                                sum_open_area += geom.area
                            sum_total_area += geom.area

                if sum_total_area > 0:
                    ratio = sum_open_area / sum_total_area
                    if ratio < 0.2:
                        factor = DynamicScore.NONE.value
                    elif 0.2 <= ratio < 0.8:
                        factor = DynamicScore.MEDIUM.value
                    else:
                        factor = DynamicScore.MAXIMUM.value
                else:
                    factor = DynamicScore.NONE.value

                unit_list.append((eco_geom[0], factor))

        # Assign scores to parcels
        parcel_count = int(arcpy.GetCount_management(agricultural_layer).getOutput(0))
        arcpy.SetProgressor("step", "Assigning natural area scores to parcels...", 0, parcel_count, 1)

        per_metric_score = category_max_scores.get("Agricultural_Landscape_Unit", 0)

        with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "SHAPE@", NaturalArea_score_field]) as parcels:
            for i, (oid, parcel_geom, _) in enumerate(parcels):
                max_overlap = 0.0
                best_factor = DynamicScore.NONE.value
                overlap_count = 0

                for unit_geom, factor in unit_list:
                    if parcel_geom.overlaps(unit_geom) or parcel_geom.within(unit_geom) or unit_geom.within(parcel_geom):
                        intersection = parcel_geom.intersect(unit_geom, 4)
                        overlap_area = intersection.area
                        if overlap_area > 0:
                            overlap_count += 1
                            if overlap_area > max_overlap:
                                max_overlap = overlap_area
                                best_factor = factor

                final_score = best_factor * per_metric_score
                parcels.updateRow([oid, parcel_geom, final_score])

                if overlap_count > 1:
                    add_warning(oid, f"NaturalArea_score: parcel overlaps {overlap_count} units. Score set based on largest overlapping unit.", False)

                arcpy.SetProgressorPosition(i + 1)

        elapsed = time() - start_time
        arcpy.AddMessage(f"Natural Area scores saved in '{NaturalArea_score_field}'. Time: {elapsed:.2f}s")
    except Exception as e:
        arcpy.AddError(f"Error calculating natural area scores: {e}")

def calculate_open_space_corridor_score():
    """Calculate open space corridor scores using weighted logic."""
    start_time = time()
    try:
        # Pre-load all rezef features once
        rezef_list = []
        with arcpy.da.SearchCursor(rezef_score_layer, ["SHAPE@", "gridcode"]) as rezef_cursor:
            for rezef_geom, gridcode in rezef_cursor:
                rezef_list.append((rezef_geom, gridcode))

        parcel_count = int(arcpy.GetCount_management(agricultural_layer).getOutput(0))
        arcpy.SetProgressor("step", "Processing parcels for open space corridor scores...", 0, parcel_count, 1)

        per_metric_score = category_max_scores.get("Agricultural_Landscape_Unit", 0)

        with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "SHAPE@", rezef_score_field]) as parcels:
            for i, (oid, geom, _) in enumerate(parcels):
                factor = DynamicScore.NONE.value
                for rezef_geom, gridcode in rezef_list:
                    if rezef_geom.contains(geom):
                        grid_val = int(gridcode)
                        if grid_val in OpenSpaceCorridorType.CORE.value:
                            factor = DynamicScore.MAXIMUM.value
                        elif grid_val in OpenSpaceCorridorType.BUFFER.value:
                            factor = DynamicScore.MEDIUM.value
                        else:
                            factor = DynamicScore.NONE.value
                        break

                final_score = factor * per_metric_score
                parcels.updateRow([oid, geom, final_score])
                arcpy.SetProgressorPosition(i + 1)

        elapsed = time() - start_time
        arcpy.AddMessage(f"Open space corridor scores saved in '{rezef_score_field}'. Time: {elapsed:.2f}s")
    except Exception as e:
        arcpy.AddError(f"Failed to calculate open space corridor scores: {e}")

def calculate_covertype_scores():
    """Calculate cover type scores using weighted logic."""
    start_time = time()
    try:
        cov_type_dict = {}
        with arcpy.da.SearchCursor(agricultural_layer, ["OID@", "CoverType"]) as search_cursor:
            for oid, cov_type in search_cursor:
                cov_type_dict[oid] = cov_type

        parcel_count = int(arcpy.GetCount_management(agricultural_layer).getOutput(0))
        arcpy.SetProgressor("step", "Processing parcels for cover type scores...", 0, parcel_count, 1)

        per_metric_score = category_max_scores.get("Agricultural_Features", 0)

        with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "SHAPE@", covertype_score_field]) as parcels:
            for i, (oid, geom, _) in enumerate(parcels):
                cov_type = cov_type_dict.get(oid, "")
                factor = DynamicScore.NONE.value
                if any(re.search(pattern, cov_type or "") for pattern in CoverType.OPEN.value):
                    factor = DynamicScore.MAXIMUM.value

                final_score = factor * per_metric_score
                parcels.updateRow([oid, geom, final_score])
                arcpy.SetProgressorPosition(i + 1)

        elapsed = time() - start_time
        arcpy.AddMessage(f"Cover type scores saved in '{covertype_score_field}'. Time: {elapsed:.2f}s")
    except Exception as e:
        arcpy.AddError(f"Failed to calculate Cover type scores: {e}")

def calculate_watertype_scores():
    """Calculate water type scores using weighted logic."""
    start_time = time()
    try:
        water_type_dict = {}
        with arcpy.da.SearchCursor(agricultural_layer, ["OID@", "WaterType"]) as search_cursor:
            for oid, water_type in search_cursor:
                water_type_dict[oid] = water_type

        parcel_count = int(arcpy.GetCount_management(agricultural_layer).getOutput(0))
        arcpy.SetProgressor("step", "Processing parcels for water type scores...", 0, parcel_count, 1)

        per_metric_score = category_max_scores.get("Agricultural_Features", 0)

        with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "SHAPE@", watertype_score_field]) as parcels:
            for i, (oid, geom, _) in enumerate(parcels):
                water_type = water_type_dict.get(oid, "")
                factor = DynamicScore.NONE.value
                if any(re.search(pattern, water_type or "") for pattern in WaterType.BAAL.value):
                    factor = DynamicScore.MAXIMUM.value
                elif any(re.search(pattern, water_type or "") for pattern in WaterType.SHELACHIN.value):
                    factor = DynamicScore.NONE.value
                elif any(re.search(pattern, water_type or "") for pattern in WaterType.OTHER.value):
                    factor = DynamicScore.NONE.value
                else:
                    add_warning(oid, f"WaterType_score: Unrecognized WaterType '{water_type}'. Assigned 0 score.", True)

                final_score = factor * per_metric_score
                parcels.updateRow([oid, geom, final_score])
                arcpy.SetProgressorPosition(i + 1)

        elapsed = time() - start_time
        arcpy.AddMessage(f"Water type scores saved in '{watertype_score_field}'. Time: {elapsed:.2f}s")
    except Exception as e:
        arcpy.AddError(f"Failed to calculate Water type scores: {e}")

def calculate_vegline_scores():
    """Calculate vegline scores using weighted logic based on external vegline layer."""
    start_time = time()
    try:
        # Pre-load all vegline features once
        vegline_list = []
        with arcpy.da.SearchCursor(vegline_layer, ["SHAPE@", "FTYPE"]) as vegline_cursor:
            for vegline_geom, ftype in vegline_cursor:
                vegline_list.append((vegline_geom, ftype))

        parcel_count = int(arcpy.GetCount_management(agricultural_layer).getOutput(0))
        arcpy.SetProgressor("step", "Processing parcels for vegline scores...", 0, parcel_count, 1)

        per_metric_score = category_max_scores.get("Natural_Features", 0)

        with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "SHAPE@", vegline_score_field]) as parcels:
            for i, (oid, geom, _) in enumerate(parcels):
                factor = DynamicScore.NONE.value
                for vegline_geom, ftype in vegline_list:
                    if geom.contains(vegline_geom) or geom.crosses(vegline_geom):
                        if any(re.search(pattern, str(ftype) or "") for pattern in VegLine.TRUE.value):
                            factor = DynamicScore.MAXIMUM.value
                        else:
                            factor = DynamicScore.NONE.value
                        break

                final_score = factor * per_metric_score
                parcels.updateRow([oid, geom, final_score])
                arcpy.SetProgressorPosition(i + 1)

        elapsed = time() - start_time
        arcpy.AddMessage(f"Vegline scores saved in '{vegline_score_field}'. Time: {elapsed:.2f}s")
    except Exception as e:
        arcpy.AddError(f"Failed to calculate Vegline scores: {e}")

def calculate_terraces_scores():
    """Calculate terraces scores using weighted logic based on external terraces layer."""
    start_time = time()
    try:
        # Pre-load all terraces features once
        terraces_list = []
        with arcpy.da.SearchCursor(terraces_layer, ["SHAPE@", "FTYPE"]) as terraces_cursor:
            for terrace_geom, ftype in terraces_cursor:
                terraces_list.append((terrace_geom, ftype))

        parcel_count = int(arcpy.GetCount_management(agricultural_layer).getOutput(0))
        arcpy.SetProgressor("step", "Processing parcels for terraces scores...", 0, parcel_count, 1)

        per_metric_score = category_max_scores.get("Natural_Features", 0)

        with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "SHAPE@", terraces_score_field]) as parcels:
            for i, (oid, geom, _) in enumerate(parcels):
                factor = DynamicScore.NONE.value
                for terrace_geom, ftype in terraces_list:
                    if geom.contains(terrace_geom) or geom.crosses(terrace_geom):
                        if any(re.search(pattern, str(ftype) or "") for pattern in TopoLine.TRUE.value):
                            factor = DynamicScore.MAXIMUM.value
                        else:
                            factor = DynamicScore.NONE.value
                        break

                final_score = factor * per_metric_score
                parcels.updateRow([oid, geom, final_score])
                arcpy.SetProgressorPosition(i + 1)

        elapsed = time() - start_time
        arcpy.AddMessage(f"Terraces scores saved in '{terraces_score_field}'. Time: {elapsed:.2f}s")
    except Exception as e:
        arcpy.AddError(f"Failed to calculate Terraces scores: {e}")

def calculate_drainage_channels_scores():
    """Calculate drainage channels scores using weighted logic based on external drainage channels layer."""
    start_time = time()
    try:
        # Pre-load all drainage channels features once
        drainage_channels_list = []
        with arcpy.da.SearchCursor(drainage_channels_layer, ["SHAPE@"]) as drainage_cursor:
            for (drainage_geom,) in drainage_cursor:
                drainage_channels_list.append(drainage_geom)

        parcel_count = int(arcpy.GetCount_management(agricultural_layer).getOutput(0))
        arcpy.SetProgressor("step", "Processing parcels for drainage channels scores...", 0, parcel_count, 1)

        per_metric_score = category_max_scores.get("Natural_Features", 0)

        with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "SHAPE@", drainage_channels_score_field]) as parcels:
            for i, (oid, geom, _) in enumerate(parcels):
                factor = DynamicScore.NONE.value
                parcel_touches_drainage = False
                
                # Check if parcel borders or is intersected by drainage channels
                for drainage_geom in drainage_channels_list:
                    # Check if the parcel contains, crosses, or touches the drainage channel
                    if geom.contains(drainage_geom) or geom.crosses(drainage_geom) or geom.touches(drainage_geom):
                        parcel_touches_drainage = True
                        factor = DynamicScore.MAXIMUM.value
                        break

                final_score = factor * per_metric_score
                parcels.updateRow([oid, geom, final_score])
                arcpy.SetProgressorPosition(i + 1)

        elapsed = time() - start_time
        arcpy.AddMessage(f"Drainage channels scores saved in '{drainage_channels_score_field}'. Time: {elapsed:.2f}s")
    except Exception as e:
        arcpy.AddError(f"Failed to calculate Drainage channels scores: {e}")

def calculate_ecological_units_scores():
    """Calculate ecological units scores based on unit area and protection percentage.
    
    Scoring rules:
    - Maximum value (15): unit area < 1,000 sq km AND protection < 0.17
    - High value (10): unit area >= 1,000 sq km AND protection < 0.17
    - Medium value (5): unit area < 1,000 sq km AND protection >= 0.17
    - Low value (0): unit area >= 1,000 sq km AND protection >= 0.17
    """
    start_time = time()
    try:
        # Pre-load all ecological unit features once with their area and protection percentage
        eco_units_list = []
        with arcpy.da.SearchCursor(ecological_units_layer, ["SHAPE@", "Protection_Percentage", "Area_Dunam"]) as eco_cursor:
            for eco_geom, protection_pct, area_dunam in eco_cursor:
                # Area_Dunam already contains the area in square kilometers
                try:
                    unit_area_sq_km = float(area_dunam) if area_dunam is not None else 0.0
                except (ValueError, TypeError):
                    unit_area_sq_km = 0.0
                # Ensure protection percentage is a float
                try:
                    protection_value = float(protection_pct) if protection_pct is not None else 0.0
                except (ValueError, TypeError):
                    protection_value = 0.0
                eco_units_list.append((eco_geom, unit_area_sq_km, protection_value))

        parcel_count = int(arcpy.GetCount_management(agricultural_layer).getOutput(0))
        arcpy.SetProgressor("step", "Processing parcels for ecological units scores...", 0, parcel_count, 1)

        per_metric_score = category_max_scores.get("NATIONAL", 0)

        with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "SHAPE@", ecological_units_score_field]) as parcels:
            for i, (oid, parcel_geom, _) in enumerate(parcels):
                # Default factor
                factor = DynamicScore.NONE.value
                max_overlap = 0.0
                best_factor = DynamicScore.NONE.value
                overlap_count = 0

                # Check all ecological units for overlap with parcel
                for unit_geom, unit_area, protection_pct in eco_units_list:
                    if parcel_geom.overlaps(unit_geom) or parcel_geom.within(unit_geom) or unit_geom.within(parcel_geom):
                        intersection = parcel_geom.intersect(unit_geom, 4)
                        overlap_area = intersection.area
                        
                        if overlap_area > 0:
                            overlap_count += 1
                            
                            # Only update if this is the largest overlap so far
                            if overlap_area > max_overlap:
                                max_overlap = overlap_area
                                
                                # Determine factor based on unit area and protection percentage
                                if unit_area < 1000 and protection_pct < 0.17:
                                    best_factor = DynamicScore.MAXIMUM.value  # Score: 15
                                elif unit_area >= 1000 and protection_pct < 0.17:
                                    best_factor = DynamicScore.MEDIUM.value   # Score: 10
                                elif unit_area < 1000 and protection_pct >= 0.17:
                                    best_factor = DynamicScore.LOW.value      # Score: 5
                                else:  # unit_area >= 1000 and protection_pct >= 0.17
                                    best_factor = DynamicScore.NONE.value     # Score: 0

                factor = best_factor
                final_score = factor * per_metric_score
                parcels.updateRow([oid, parcel_geom, final_score])

                if overlap_count > 1:
                    add_warning(oid, f"EcologicalUnits_score: parcel overlaps {overlap_count} ecological units. Score set based on largest overlapping unit.", False)

                arcpy.SetProgressorPosition(i + 1)

        elapsed = time() - start_time
        arcpy.AddMessage(f"Ecological units scores saved in '{ecological_units_score_field}'. Time: {elapsed:.2f}s")
    except Exception as e:
        arcpy.AddError(f"Failed to calculate Ecological units scores: {e}")

def calculate_sum_scores():
    """Calculate the sum of all scores for each parcel."""
    start_time = time()
    try:
        # Collect all score fields that are active
        score_fields = []
        if corridor_score_field:
            score_fields.append(corridor_score_field)
        if floodplain_score_field:
            score_fields.append(floodplain_score_field)
        if NaturalArea_score_field:
            score_fields.append(NaturalArea_score_field)
        if rezef_score_field:
            score_fields.append(rezef_score_field)
        if ecological_units_score_field:
            score_fields.append(ecological_units_score_field)
        if covertype_score_field:
            score_fields.append(covertype_score_field)
        if watertype_score_field:
            score_fields.append(watertype_score_field)
        if vegline_score_field:
            score_fields.append(vegline_score_field)
        if terraces_score_field:
            score_fields.append(terraces_score_field)
        if drainage_channels_score_field:
            score_fields.append(drainage_channels_score_field)
        
        if not score_fields:
            arcpy.AddWarning("No score fields found. SUM calculation skipped.")
            return
        
        parcel_count = int(arcpy.GetCount_management(agricultural_layer).getOutput(0))
        arcpy.SetProgressor("step", "Calculating sum of scores...", 0, parcel_count, 1)
        
        # Prepare field list for cursor
        cursor_fields = ["OID@"] + score_fields + ["SUM"]
        
        with arcpy.da.UpdateCursor(agricultural_layer, cursor_fields) as cursor:
            for i, row in enumerate(cursor):
                # First element is OID, last is SUM field (empty)
                score_values = row[1:-1]  # Get all score fields
                
                # Sum only non-null values
                total_sum = sum(v for v in score_values if v is not None)
                
                # Update the SUM field
                row[-1] = total_sum
                cursor.updateRow(row)
                arcpy.SetProgressorPosition(i + 1)
        
        elapsed = time() - start_time
        arcpy.AddMessage(f"Sum scores calculated and saved in 'SUM' field. Time: {elapsed:.2f}s")
        arcpy.AddMessage(f"  Active score fields: {len(score_fields)}")
        
    except Exception as e:
        arcpy.AddError(f"Failed to calculate sum scores: {e}")

def write_warnings():
    """Write collected warnings to WARNING field."""
    try:
        if warnings_by_oid:
            with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "WARNING"]) as cursor:
                for oid, current_warn in cursor:
                    msgs = warnings_by_oid.get(oid)
                    if msgs:
                        new_warn = "; ".join(msgs)
                        if current_warn:
                            new_warn = current_warn + "; " + new_warn
                        cursor.updateRow([oid, new_warn])
            arcpy.AddMessage("Warnings written to 'WARNING' field.")
    except Exception as e:
        arcpy.AddError(f"Failed to write warnings: {e}")

# -------------------------------
# MAIN EXECUTION
# -------------------------------
try:
    main_start_time = time()
    arcpy.AddMessage("========== AgroEco Analysis ==========")
    arcpy.AddMessage("Start Time: {}".format(datetime.now().strftime("%d/%m/%Y %H:%M:%S")))
    arcpy.AddMessage("--------------------------------------")

    arcpy.SetProgressor("step", "Running AgroEco Analysis...", 0, 12, 1)

    # Step 1: Corridor
    if corridor_layer and corridor_score_field:
        arcpy.AddMessage("Step 1: Calculating corridor scores...")
        calculate_corridor_scores()
    else:
        arcpy.AddWarning("Corridor score skipped (missing Corridor layer or field).")
    arcpy.SetProgressorPosition(1)

    # Step 2: Floodplain
    if floodplain_layer and floodplain_score_field:
        arcpy.AddMessage("Step 2: Calculating floodplain scores...")
        calculate_floodplain_scores()
    else:
        arcpy.AddWarning("Floodplain score skipped (missing floodplain layer or field).")
    arcpy.SetProgressorPosition(2)

    # Step 3: Natural Area
    if landscape_units_layer and NaturalArea_score_field:
        arcpy.AddMessage("Step 3: Calculating natural area scores...")
        calculate_natural_area_scores()
    else:
        arcpy.AddWarning("Natural area score skipped (missing landscape units layer or field).")
    arcpy.SetProgressorPosition(3)

    # Step 4: Open Space Corridor
    if rezef_score_layer and rezef_score_field:
        arcpy.AddMessage("Step 4: Calculating open space corridor scores...")
        calculate_open_space_corridor_score()
    else:
        arcpy.AddWarning("Open space corridor score skipped (missing rezef layer or field).")
    arcpy.SetProgressorPosition(4)

    # Step 5: Cover Type
    if covertype_score_field:
        arcpy.AddMessage("Step 5: Calculating cover type scores...")
        calculate_covertype_scores()
    else:
        arcpy.AddWarning("Cover type score skipped (missing field).")
    arcpy.SetProgressorPosition(5)

    # Step 6: Water Type
    if watertype_score_field:
        arcpy.AddMessage("Step 6: Calculating water type scores...")
        calculate_watertype_scores()
    else:
        arcpy.AddWarning("Water type score skipped (missing field).")
    arcpy.SetProgressorPosition(6)

    # Step 7: Vegline
    if vegline_layer and vegline_score_field:
        arcpy.AddMessage("Step 7: Calculating vegline scores...")
        calculate_vegline_scores()
    else:
        arcpy.AddWarning("Vegline score skipped (missing vegline layer or field).")
    arcpy.SetProgressorPosition(7)

    # Step 8: Terraces
    if terraces_layer and terraces_score_field:
        arcpy.AddMessage("Step 8: Calculating terraces scores...")
        calculate_terraces_scores()
    else:
        arcpy.AddWarning("Terraces score skipped (missing terraces layer or field).")
    arcpy.SetProgressorPosition(8)

    # Step 9: Drainage Channels
    if drainage_channels_layer and drainage_channels_score_field:
        arcpy.AddMessage("Step 9: Calculating drainage channels scores...")
        calculate_drainage_channels_scores()
    else:
        arcpy.AddWarning("Drainage channels score skipped (missing drainage channels layer or field).")
    arcpy.SetProgressorPosition(9)

    # Step 10: Ecological Units
    if ecological_units_layer and ecological_units_score_field:
        arcpy.AddMessage("Step 10: Calculating ecological units scores...")
        calculate_ecological_units_scores()
    else:
        arcpy.AddWarning("Ecological units score skipped (missing ecological units layer or field).")
    arcpy.SetProgressorPosition(10)

    # Step 11: Sum of all scores
    arcpy.AddMessage("Step 11: Calculating sum of all scores...")
    calculate_sum_scores()
    arcpy.SetProgressorPosition(11)

    # Note: calculate_naturalprop_scores() is replaced by calculate_vegline_scores()

    # Write warnings
    write_warnings()

    main_elapsed = time() - main_start_time
    arcpy.AddMessage("--------------------------------------")
    arcpy.AddMessage("Process completed successfully!")
    arcpy.AddMessage("End Time: {}".format(datetime.now().strftime("%d/%m/%Y %H:%M:%S")))
    arcpy.AddMessage("Total Execution Time: {:.2f} minutes".format(main_elapsed / 60))
    arcpy.AddMessage("======================================")

except Exception as e:
    arcpy.AddError(f"AgroEco Analysis failed: {e}")