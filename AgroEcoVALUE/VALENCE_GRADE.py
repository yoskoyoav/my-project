import pandas as pd
import arcpy
from time import time

try:
    # Get parameters
    agricultural_layer = arcpy.GetParameterAsText(0)
    sum_field = arcpy.GetParameterAsText(1)
    
    start_time = time()
    arcpy.AddMessage("========== Valence Grade Calculator ==========")
    
    # Validate inputs
    if not agricultural_layer:
        arcpy.AddError("Agricultural layer is required.")
        raise arcpy.ExecuteError
    
    if not sum_field:
        arcpy.AddError("SUM field name is required.")
        raise arcpy.ExecuteError
    
    # Check if SUM field exists
    field_names = [f.name for f in arcpy.ListFields(agricultural_layer)]
    if sum_field not in field_names:
        arcpy.AddError(f"Field '{sum_field}' not found in agricultural layer.")
        raise arcpy.ExecuteError
    
    # Add VALENCE_GRADE field if it doesn't exist
    if 'VALENCE_GRADE' not in field_names:
        arcpy.AddField_management(agricultural_layer, 'VALENCE_GRADE', 'TEXT')
        arcpy.AddMessage("Created new 'VALENCE_GRADE' field.")
    
    # Load all data into a DataFrame
    arcpy.AddMessage("Loading data from agricultural layer...")
    data = [(row[0], row[1]) for row in arcpy.da.SearchCursor(agricultural_layer, ["OID@", sum_field])]
    
    if not data:
        arcpy.AddWarning("No data found in agricultural layer.")
        arcpy.AddMessage("Process completed with no changes.")
        raise arcpy.ExecuteError
    
    df = pd.DataFrame(data, columns=["OID", sum_field])
    
    # Split into 3 equal bins with labels
    arcpy.AddMessage("Calculating valence grades using equal-width binning (3 bins)...")
    df["VALENCE_GRADE"] = pd.cut(
        df[sum_field],
        bins=3,
        labels=["ערכיות נמוכה", "ערכיות בינונית", "ערכיות גבוהה"],
        include_lowest=True
    )
    
    # Write back to the layer
    arcpy.AddMessage("Writing grades back to layer...")
    oid_to_grade = dict(zip(df["OID"], df["VALENCE_GRADE"]))
    
    with arcpy.da.UpdateCursor(agricultural_layer, ["OID@", "VALENCE_GRADE"]) as cursor:
        for oid, _ in cursor:
            cursor.updateRow([oid, oid_to_grade.get(oid)])
    
    # Display statistics
    elapsed = time() - start_time
    arcpy.AddMessage("--------------------------------------")
    arcpy.AddMessage(f"ערכיות נמוכה: {(df['VALENCE_GRADE'] == 'ערכיות נמוכה').sum()} חלקות")
    arcpy.AddMessage(f"ערכיות בינונית: {(df['VALENCE_GRADE'] == 'ערכיות בינונית').sum()} חלקות")
    arcpy.AddMessage(f"ערכיות גבוהה: {(df['VALENCE_GRADE'] == 'ערכיות גבוהה').sum()} חלקות")
    arcpy.AddMessage("--------------------------------------")
    arcpy.AddMessage(f"Process completed successfully in {elapsed:.2f}s")
    arcpy.AddMessage("============================================")

except Exception as e:
    arcpy.AddError(f"Failed to calculate valence grades: {e}")