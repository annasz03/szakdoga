export interface Idisease {
    name: string;
    ageLabel: string;
    age: [number, number];
    gender: string;
    symptoms: string[];
    associatedDiseases: string[];
    description: string;
    causes: string[];
    prevention: string[];
    treatment: string[];
    riskFactors: string[];
    painful: boolean;
    painLocation: string[];
}
  