import csv
import json
import os
from datetime import datetime

# Paths
DATA_DIR = "/Users/dmhoang/Downloads/10000-Patients"
OUTPUT_DIR = "./temp"

def format_date(date_str):
    if not date_str or date_str == 'Unknown':
        return None
    try:
        # Expected format: 1975-01-04 14:49:59.587
        dt = datetime.strptime(date_str.split('.')[0], '%Y-%m-%d %H:%M:%S')
        return dt.strftime('%Y-%m-%d')
    except:
        try:
            return date_str.split(' ')[0]
        except:
            return None

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # 1. Load First 100 Patients
    patients = {}
    patient_ids = []
    with open(f"{DATA_DIR}/PatientCorePopulatedTable.csv", 'r') as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            if count >= 100:
                break
            pid = row['PatientID']
            patients[pid] = {
                "resourceType": "Patient",
                "id": pid,
                "identifier": [{"system": "urn:oid:1.2.3.4", "value": pid}],
                "gender": row['PatientGender'].lower(),
                "birthDate": format_date(row['PatientDateOfBirth']),
                "name": [{"text": "Synthetic Patient"}], # Privacy-safe placeholder
                "maritalStatus": {"text": row['PatientMaritalStatus']} if row['PatientMaritalStatus'] != 'Unknown' else None,
                "communication": [{"language": {"text": row['PatientLanguage']}}] if row['PatientLanguage'] != 'Unknown' else None
            }
            patient_ids.append(pid)
            count += 1
    
    selected_pids = set(patient_ids)
    print(f"Loaded {len(selected_pids)} patients.")

    # 2. Load Admissions (Encounters)
    encounters = {pid: [] for pid in selected_pids}
    with open(f"{DATA_DIR}/AdmissionsCorePopulatedTable.csv", 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = row['PatientID']
            if pid in selected_pids:
                encounters[pid].append({
                    "resourceType": "Encounter",
                    "id": f"enc-{row['AdmissionID']}",
                    "status": "finished",
                    "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "IMP", "display": "inpatient"},
                    "subject": {"reference": f"Patient/{pid}"},
                    "period": {
                        "start": format_date(row['AdmissionStartDate']),
                        "end": format_date(row['AdmissionEndDate'])
                    }
                })

    # 3. Load Diagnoses (Conditions)
    conditions = {pid: [] for pid in selected_pids}
    with open(f"{DATA_DIR}/AdmissionsDiagnosesCorePopulatedTable.csv", 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = row['PatientID']
            if pid in selected_pids:
                conditions[pid].append({
                    "resourceType": "Condition",
                    "id": f"cond-{pid}-{row['AdmissionID']}",
                    "subject": {"reference": f"Patient/{pid}"},
                    "encounter": {"reference": f"Encounter/enc-{row['AdmissionID']}"},
                    "code": {
                        "coding": [{"system": "http://hl7.org/fhir/sid/icd-10", "code": row['PrimaryDiagnosisCode']}],
                        "text": row['PrimaryDiagnosisDescription']
                    },
                    "clinicalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]}
                })

    # 4. Stream Labs (Observations) - 1GB File
    observations = {pid: [] for pid in selected_pids}
    print("Streaming large Labs file...")
    with open(f"{DATA_DIR}/LabsCorePopulatedTable.csv", 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = row['PatientID']
            if pid in selected_pids:
                observations[pid].append({
                    "resourceType": "Observation",
                    "status": "final",
                    "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "laboratory"}]}],
                    "code": {"text": row['LabName']},
                    "subject": {"reference": f"Patient/{pid}"},
                    "encounter": {"reference": f"Encounter/enc-{row['AdmissionID']}"},
                    "effectiveDateTime": format_date(row['LabDateTime']),
                    "valueQuantity": {
                        "value": float(row['LabValue']) if row['LabValue'] else 0,
                        "unit": row['LabUnits'],
                        "system": "http://unitsofmeasure.org"
                    }
                })

    # 5. Generate Bundles
    print("Generating Bundles...")
    for pid in selected_pids:
        bundle = {
            "resourceType": "Bundle",
            "type": "collection",
            "entry": []
        }
        
        # Add Patient
        bundle["entry"].append({"resource": patients[pid]})
        
        # Add Encounters
        for enc in encounters[pid]:
            bundle["entry"].append({"resource": enc})
            
        # Add Conditions
        for cond in conditions[pid]:
            bundle["entry"].append({"resource": cond})
            
        # Add Observations
        for obs in observations[pid]:
            bundle["entry"].append({"resource": obs})
            
        # Write to file
        with open(f"{OUTPUT_DIR}/patient_{pid}.json", 'w') as out:
            json.dump(bundle, out, indent=2)

    print(f"Success! 100 FHIR bundles generated in {OUTPUT_DIR}/")

if __name__ == "__main__":
    main()
