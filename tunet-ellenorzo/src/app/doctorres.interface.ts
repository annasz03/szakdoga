export interface IDoctorResponse {
    name: any;
    message: string;
    result: Array<{
      key: number;
      value: {
        name: string;
        picture: string;
        age: number;
        gender: string;
        speciality: string[];
        area: string[];
        cities: string[];
        phone: string;
        available: any[];
      };
    }>;
  }
  