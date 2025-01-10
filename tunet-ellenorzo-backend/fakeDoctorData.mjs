const fakeDoctorData = new Map([
    [
      1,
      {
        name: 'Kiss János',
        picture: 'kép',
        age: 56,
        gender: 'Férfi',
        speciality: ['fogorvos'],
        area: {
          'Szeged': ['Föltámadás utca 20'],
            'Hódmezővásárhely': ['Kossuth tér 5'],
            'Makó': ['Arany János utca 10']
          },
        cities: ['Szeged', 'Hódmezővásárhely', 'Makó'],
        phone: '+36703004000',
        available: [
            { day: 'Hétfő', city: 'Szeged', address: ['Föltámadás utca 20'] },
            { day: 'Kedd', city: 'Makó', address: ['Arany János utca 10'] },
            { day: 'Szerda', city: 'Hódmezővásárhely', address: ['Kossuth tér 5'] }
          ]
      },
    ],
    [
      2,
      {
        name: 'Nagy Anikó',
        picture: 'kép',
        age: 60,
        gender: 'Nő',
        speciality: ['sebész'],
        area: {
            'Szeged': ['Semmelweis utca 8'],
          },
        cities: ['Szeged'],
        phone: '+36703004001',
        available: [
            { day: 'Hétfő', city: 'Szeged', address: ['Semmelweis utca 8'] },
          ]
      },
    ],
  ]);
  
  

  export default fakeDoctorData;
  