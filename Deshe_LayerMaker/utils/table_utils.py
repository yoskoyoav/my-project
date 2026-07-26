import arcpy
import os
import sys
from pathlib import Path
import pandas as pd
import domains
import excel_values

def load_excel_data(excel_path, sheet_name):
    return pd.read_excel(excel_path, sheet_name=sheet_name)

def add_field(layer_path, field_name, field_alias, field_type, field_length=None):
    if field_length and pd.notna(field_length):
        arcpy.AddField_management(
            layer_path,
            field_name,
            field_type,
            field_alias=field_alias,
            field_length=int(field_length)
        )
    else:
        arcpy.AddField_management(
            layer_path,
            field_name,
            field_type,
            field_alias=field_alias
        )


def load_dynamic_domains_from_excel(excel_path, gdb_path, mode="skip"):
    """
    קורא דומיינים מאקסל ויוצר/עדכן אותם במסד הנתונים
    
    Args:
        excel_path: נתיב לקובץ אקסל
        gdb_path: נתיב לקובץ הגיאודטיבס
        mode: אופן הטיפול בדומיינים קיימים
            - "skip": דלג על דומיינים קיימים (ברירת מחדל)
            - "update": הוסף ערכים חדשים לדומיינים קיימים
            - "report": הראה הבדלים בלבד, לא תשנה כלום
    """
    try:
        df = pd.read_excel(excel_path, sheet_name="domains")
        existing_domains_list = arcpy.da.ListDomains(gdb_path)
        existing_domains_dict = {d.name: d for d in existing_domains_list}
        existing_domain_names = list(existing_domains_dict.keys())
        
        for domain_name in df['domain_name'].unique():
            if not pd.notna(domain_name):
                continue
            
            domain_df = df[df['domain_name'] == domain_name]
            excel_codes = {str(row['code']): str(row['value']) for _, row in domain_df.iterrows()}
            
            if domain_name not in existing_domain_names:
                # דומיין לא קיים - צור אותו
                arcpy.CreateDomain_management(gdb_path, domain_name, field_type="TEXT")
                for code, value in excel_codes.items():
                    arcpy.AddCodedValueToDomain_management(gdb_path, domain_name, code, value)
                arcpy.AddMessage(f"✓ Domain '{domain_name}' created successfully from Excel")
            
            elif mode == "skip":
                # דומיין קיים והמצב הוא skip
                arcpy.AddMessage(f"⊘ Domain '{domain_name}' already exists - skipping (mode: skip)")
            
            elif mode == "update":
                # דומיין קיים והמצב הוא update - הוסף ערכים חדשים בלבד
                existing_domain = existing_domains_dict[domain_name]
                existing_codes = set(existing_domain.codedValues.keys())
                
                added_count = 0
                for code, value in excel_codes.items():
                    if code not in existing_codes:
                        try:
                            arcpy.AddCodedValueToDomain_management(gdb_path, domain_name, code, value)
                            arcpy.AddMessage(f"  + Added to '{domain_name}': {code} = {value}")
                            added_count += 1
                        except Exception as e:
                            arcpy.AddWarning(f"  ! Failed to add {code} to {domain_name}: {str(e)}")
                    else:
                        arcpy.AddMessage(f"  ~ Already exists in '{domain_name}': {code}")
                
                if added_count > 0:
                    arcpy.AddMessage(f"✓ Domain '{domain_name}' updated with {added_count} new values")
                else:
                    arcpy.AddMessage(f"○ Domain '{domain_name}' is up to date - no new values to add")
            
            elif mode == "report":
                # דומיין קיים והמצב הוא report - הראה הבדלים בלבד
                existing_domain = existing_domains_dict[domain_name]
                existing_codes = set(existing_domain.codedValues.keys())
                existing_values_dict = existing_domain.codedValues  # {code: value}
                
                new_codes = set(excel_codes.keys()) - existing_codes
                removed_codes = existing_codes - set(excel_codes.keys())
                changed_codes = {code for code in existing_codes & set(excel_codes.keys()) 
                               if existing_values_dict.get(code) != excel_codes.get(code)}
                
                arcpy.AddMessage(f"\n📊 Report for Domain '{domain_name}':")
                if new_codes:
                    arcpy.AddMessage(f"  NEW ({len(new_codes)}): {', '.join(sorted(new_codes))}")
                if removed_codes:
                    arcpy.AddMessage(f"  REMOVED ({len(removed_codes)}): {', '.join(sorted(removed_codes))}")
                if changed_codes:
                    arcpy.AddMessage(f"  CHANGED ({len(changed_codes)}): {', '.join(sorted(changed_codes))}")
                if not new_codes and not removed_codes and not changed_codes:
                    arcpy.AddMessage(f"  ✓ No differences - domain is in sync")
    
    except FileNotFoundError:
        arcpy.AddWarning(f"Could not find domains Excel file: {excel_path}")
    except Exception as e:
        arcpy.AddError(f"Error loading dynamic domains from Excel: {str(e)}")


def add_domain_if_needed(gdb_path, layer_path, field_name, domain_name):
    existing_domains = [d.name for d in arcpy.da.ListDomains(gdb_path)]

    if domain_name not in existing_domains:
        arcpy.CreateDomain_management(gdb_path, domain_name, field_type="TEXT")

        domain_dict = {e.name: e.value for e in getattr(domains, domain_name)}
        for code, description in domain_dict.items():
            arcpy.AddCodedValueToDomain_management(gdb_path, domain_name, code, description)

    arcpy.AssignDomainToField_management(layer_path, field_name, domain_name)


def set_default_value(layer_path, field_name, default_value):
    arcpy.management.CalculateField(
        layer_path,
        field_name,
        default_value,
        "PYTHON3"
    )

def get_layer_fields(layer_path):
    return [field.name for field in arcpy.ListFields(layer_path)]

def create_field(gdb_path, layer_name, field_name, field_alias, field_type, field_length, domain_name, default_value ):
    layer_path = os.path.join(gdb_path, layer_name)

    layer_fields = get_layer_fields(layer_path)
    if field_name not in layer_fields:
        add_field(layer_path, field_name, field_alias, field_type, field_length)

    if pd.notna(domain_name):
        add_domain_if_needed(gdb_path, layer_path, field_name, domain_name)

    if pd.notna(default_value):
        set_default_value(layer_path, field_name, default_value)


def add_fields_to_layer_from_excel(layer_df, layer_name, gdb_path):

    for _, row in layer_df.iterrows():
        field_name = row[excel_values.ExcelColumns.NAME.value]
        field_alias = row[excel_values.ExcelColumns.ALIAS.value]
        field_type = row[excel_values.ExcelColumns.TYPE.value]
        field_length = row[excel_values.ExcelColumns.LENGTH.value] if excel_values.ExcelColumns.LENGTH.value in row.index else None
        domain_name = row[excel_values.ExcelColumns.DOMAIN.value]
        default_value = row[excel_values.ExcelColumns.DEFAULT_VALUE.value]

        create_field(gdb_path, layer_name, field_name, field_alias, field_type, field_length, domain_name, default_value)

def verify_required_fields(layer_path, layer_df):
    layer_fields = get_layer_fields(layer_path)

    common_error_df = layer_df[
    layer_df[excel_values.ExcelColumns.COMMON_ERROR.value].notna() &
    layer_df[excel_values.ExcelColumns.EXISTS.value].notna()
]

    # Handle common errors and rename fields
    for _, row in common_error_df.iterrows():
        if row[excel_values.ExcelColumns.COMMON_ERROR.value] in layer_fields and row[excel_values.ExcelColumns.NAME.value] not in layer_fields:
            arcpy.management.AlterField(
                in_table=layer_path,
                field=row[excel_values.ExcelColumns.COMMON_ERROR.value],
                new_field_name=row[excel_values.ExcelColumns.NAME.value],
                new_field_alias=row[excel_values.ExcelColumns.ALIAS.value]
            )

    layer_fields = get_layer_fields(layer_path)
    exists_layer_df = layer_df[layer_df[excel_values.ExcelColumns.EXISTS.value].notna()][excel_values.ExcelColumns.NAME.value].tolist()

    missing_fields = [field for field in exists_layer_df if field not in layer_fields]

    if missing_fields:
        arcpy.AddError(f"The following fields are missing in the input layer: {', '.join(missing_fields)}")
        return False

    return True


def remove_extra_fields_from_layer(layer_df, layer_path):

    layer_fields = [field.name for field in arcpy.ListFields(layer_path) if not field.required]
    fields_to_delete = [field for field in layer_fields if field not in layer_df[excel_values.ExcelColumns.NAME.value].values]

    if fields_to_delete:
        arcpy.DeleteField_management(layer_path, fields_to_delete)


def get_geometry_type_from_layer(layer_df):

    if len(layer_df) == 0:
        raise ValueError("Layer not found in configuration")
    
    geometry_column_name = excel_values.ExcelColumns.GEOMETRY_TYPE.value
    geometry_type = layer_df[geometry_column_name].iloc[0]
    
    if geometry_type is None or pd.isna(geometry_type):
        raise ValueError("No geometry type defined for layer")
    
    return geometry_type


def enable_attachments_if_needed(layer_path, layer_df):
    """Enable attachments for the layer if specified in the Excel configuration"""
    if len(layer_df) > 0:
        enable_attachments = layer_df[excel_values.ExcelColumns.ATTACHMENTS.value].iloc[0]
        if enable_attachments == 1:
            arcpy.EnableAttachments_management(layer_path)