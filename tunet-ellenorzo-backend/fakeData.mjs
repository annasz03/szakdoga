const fakeData = new Map([
    [
      'commonCold',
      {
        name: 'Megfázás',
        ageLabel: 'Minden korosztály',
        age: [0, 999],
        gender: 'Mindkettő',
        symptoms: [
          'orrfolyás',
          'torokfájás',
          'köhögés',
          'hőemelkedés',
          'tüsszögés',
        ],
        associatedDiseases: ['arcüreggyulladás', 'fülgyulladás'],
        description:
          'A megfázás egy enyhe, vírusos eredetű felső légúti fertőzés, amely gyakori az őszi és téli hónapokban.',
        causes: [
          'vírusfertőzés',
          'gyengült immunrendszer',
          'hideg időjárás',
        ],
        prevention: [
          'egészséges táplálkozás',
          'rendszeres testmozgás',
        ],
        treatment: [
          'sok folyadékbevitel',
          'pihenés',
          'fájdalomcsillapító',
        ],
        riskFactors: ['stressz', 'alváshiány'],
        painful: false,
        painLocation: [],
      },
    ],
    [
      'prostateCancer',
      {
        name: 'Prosztatarák',
        ageLabel: '50 felett',
        age: [50, 999],
        gender: 'Férfi',
        symptoms: [
          'gyakori vizelet',
          'fájdalmas ürítés',
          'véres vizelet',
        ],
        associatedDiseases: [
          'húgyúti fertőzés',
          'veseproblémák',
        ],
        description:
          'A prosztatarák a prosztata mirigy rosszindulatú daganatos megbetegedése, amely gyakran lassan alakul ki.',
        causes: [
          'genetikai hajlam',
          'hormonális változások',
          'egészségtelen életmód',
        ],
        prevention: [
          'egészséges étrend, gazdag gyümölcsökben és zöldségekben',
          'rendszeres szűrővizsgálatok',
          'testmozgás',
        ],
        treatment: [
          'műtéti beavatkozás',
          'sugárterápia',
          'hormonkezelés',
          'kemoterápia',
        ],
        riskFactors: [
          'idősebb életkor',
          'családi anamnézis',
          'elhízás',
          'dohányzás',
        ],
        painful: true,
        painLocation: [
            'has',
            'medence',
        ],
      },
    ],
  ]);
  
  

  export default fakeData;
  