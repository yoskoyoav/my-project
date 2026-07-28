import arcpy

def append_survey_with_multiple_tables(source_fc, target_fc, related_tables_mapping):
    """
    ממזג שכבת נקודות ומספר טבלאות מקושרות תוך שמירה על קשרי ה-GlobalID.
    
    related_tables_mapping: רשימה של צמדים (טבלת מקור, טבלת יעד).
    לדוגמה: 
    [
        ("Survey_A_Trees", "Survey_B_Trees"), 
        ("Survey_A_Shrubs", "Survey_B_Shrubs"),
        ...
    ]
    """
    temp_id_field = "ApresGlobalID"
    
    # 1. טיפול בשכבת הנקודות המרכזית ויצירת המיפוי
    print(f"Processing Feature Classes: {source_fc} -> {target_fc}")
    arcpy.management.AddField(source_fc, temp_id_field, "GUID")
    arcpy.management.CalculateField(source_fc, temp_id_field, "!GlobalID!", "PYTHON3")
    
    if not arcpy.ListFields(target_fc, temp_id_field):
        arcpy.management.AddField(target_fc, temp_id_field, "GUID")
        
    arcpy.management.Append(source_fc, target_fc, "NO_TEST")
    
    print("Building GlobalID dictionary mapping in memory...")
    id_mapping = {}
    where_clause = f"{temp_id_field} IS NOT NULL"
    
    with arcpy.da.SearchCursor(target_fc, [temp_id_field, "GlobalID"], where_clause) as cursor:
        for row in cursor:
            old_id = row[0]
            new_id = row[1]
            if old_id:
                id_mapping[old_id.upper()] = new_id.upper()
                
    # 2. לולאה שרצה על כל ה-4 טבלאות המקושרות
    for source_table, target_table in related_tables_mapping:
        print(f"\nProcessing Related Table: {source_table} -> {target_table}")
        
        # עדכון המפתחות הזרים בטבלת המקור הנוכחית
        with arcpy.da.UpdateCursor(source_table, ["ParentGlobalID"]) as cursor:
            for row in cursor:
                old_parent_id = row[0]
                if old_parent_id and old_parent_id.upper() in id_mapping:
                    row[0] = id_mapping[old_parent_id.upper()]
                    cursor.updateRow(row)
                    
        # מיזוג הטבלה המקושרת ליעד
        print(f"Appending {source_table} to {target_table}...")
        arcpy.management.Append(source_table, target_table, "NO_TEST")
        
    # 3. ניקוי השדה הזמני משכבת הנקודות
    print("\nCleaning up temporary field from source feature class...")
    arcpy.management.DeleteField(source_fc, temp_id_field)
    
    print("All points and related tables were appended successfully!")

# ==========================================
# איך מריצים את זה בפועל?
# ==========================================

# מגדירים את שכבות הנקודות
source_points = "Survey_A_Points"
target_points = "Survey_B_Points"

# מגדירים רשימה של 4 הטבלאות המקושרות - [מקור, יעד]
tables_to_append = [
    ("Survey_A_Table1", "Survey_B_Table1"),
    ("Survey_A_Table2", "Survey_B_Table2"),
    ("Survey_A_Table3", "Survey_B_Table3"),
    ("Survey_A_Table4", "Survey_B_Table4")
]

# קוראים לפונקציה
# append_survey_with_multiple_tables(source_points, target_points, tables_to_append)