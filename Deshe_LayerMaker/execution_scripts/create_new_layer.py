import arcpy
import sys
import os
from pathlib import Path
from importlib import reload


DESHE_TOOLS_FOLDER_PATH = str(Path(__file__).parents[1].absolute())

def add_to_root(folders):
    if DESHE_TOOLS_FOLDER_PATH not in sys.path:
        sys.path.insert(0, DESHE_TOOLS_FOLDER_PATH)
    for folder in folders:
        if rf"{DESHE_TOOLS_FOLDER_PATH}\{folder}" not in sys.path:
            sys.path.insert(1, rf"{DESHE_TOOLS_FOLDER_PATH}\{folder}")


add_to_root(['utils', 'enums'])

import table_utils
reload(table_utils)
import excel_values
reload(excel_values)

SHEET_NAME = "table_modification"


def execute(layer_name, geometry_type, domain_mode="skip"):

    SPATIAL_REFERENCE = arcpy.SpatialReference(2039)

    aprx = arcpy.mp.ArcGISProject("CURRENT")
    gdb_path = aprx.defaultGeodatabase
    configuration_path = os.path.join(DESHE_TOOLS_FOLDER_PATH, "configuration")
    excel_path = os.path.join(configuration_path, "fields.xlsx")
    domains_excel_path = os.path.join(configuration_path, "domains.xlsx")

    arcpy.env.overwriteOutput = True
    
    # Load dynamic domains from Excel if file exists
    if os.path.exists(domains_excel_path):
        table_utils.load_dynamic_domains_from_excel(domains_excel_path, gdb_path, mode=domain_mode)
    
    arcpy.CreateFeatureclass_management(gdb_path,
                                        layer_name,
                                        geometry_type,
                                        spatial_reference=SPATIAL_REFERENCE)


    # Full path to created layer
    layer_path = os.path.join(gdb_path, layer_name)

    df = table_utils.load_excel_data(excel_path, SHEET_NAME)
    layer_df = df[df[excel_values.ExcelColumns.TABLE_NAME.value] == layer_name]
    
    # Enable attachments if configured in Excel (this creates the _ATTACH table automatically)
    table_utils.enable_attachments_if_needed(layer_path, layer_df)
    
    table_utils.add_fields_to_layer_from_excel(layer_df, layer_name, gdb_path)

    aprx = arcpy.mp.ArcGISProject("CURRENT")
    active_map = aprx.activeMap
    active_map.addDataFromPath(os.path.join(gdb_path, layer_name))

if __name__ == "__main__":
    layer_name = arcpy.GetParameter(0)
    domain_mode = arcpy.GetParameterAsText(1) if arcpy.GetParameter(1) else "skip"
    
    # Validate domain_mode parameter
    valid_modes = ["skip", "update", "report"]
    if domain_mode not in valid_modes:
        arcpy.AddWarning(f"Invalid domain_mode '{domain_mode}'. Using default 'skip'. Valid options: {', '.join(valid_modes)}")
        domain_mode = "skip"
    
    configuration_path = os.path.join(DESHE_TOOLS_FOLDER_PATH, "configuration")
    excel_path = os.path.join(configuration_path, "fields.xlsx")
    
    df = table_utils.load_excel_data(excel_path, SHEET_NAME)
    layer_df = df[df[excel_values.ExcelColumns.TABLE_NAME.value] == layer_name]
    
    geometry_type = table_utils.get_geometry_type_from_layer(layer_df)
    execute(layer_name, geometry_type, domain_mode)