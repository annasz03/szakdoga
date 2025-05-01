import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { setTimeout as delay } from 'timers/promises';

puppeteer.use(StealthPlugin());


function parseLocation(location) {
  if (!location) return { city: null, address: null };

  const clean = location.replace(/\s+/g, ' ').trim();

  const match = clean.match(/(.+?[a-záéíóöőúüű])(?=[A-ZÁÉÍÓÖŐÚÜŰ])/);

  if (match) {
    const city = match[0].trim();
    const address = clean.slice(city.length).trim();
    return { city, address };
  }

  const numMatch = clean.match(/^(.+?)\s+\d/);
  if (numMatch) {
    const city = numMatch[1].trim();
    const address = clean.slice(city.length).trim();
    return { city, address };
  }
  return {
    city: clean,
    address: null
  };
}




function formatPhoneNumber(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{3})(\d{4})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}-${match[4]}` : null;
}

async function scrapeDoctors(browser, pageNumber) {
  const page = await browser.newPage();
  const cities = [];
  const specialties = [];

    await page.goto(`https://www.webbeteg.hu/keresok/orvos/oldal/${pageNumber}`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await page.evaluate(() => {
      window.scrollTo(0, Math.random() * document.body.scrollHeight);
    });
    await delay(1000);

    await page.waitForSelector('.orvoslista .row.striped', { timeout: 15000 });

    const doctors = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.orvoslista .row.striped')).map((item) => {
        const nameElement = item.querySelector('.col-12.col-lg-9 a');
        const detailsElement = item.querySelector('.col-12.col-lg-9');
        const locationElement = item.querySelector('.col-6.col-lg-3.py-3');
        const phoneElement = item.querySelector('.phone-info');

        return {
          name: nameElement?.textContent?.trim(),
          specialty: detailsElement?.childNodes[2]?.textContent?.trim(),
          location: locationElement?.textContent?.replace(/\s+/g, ' ').trim(),
          phone: phoneElement?.textContent?.trim(),
          profileUrl: nameElement?.href,
        };
      }).filter(d => d.name);
    });

    doctors.forEach((doctor) => {
      if (doctor.location) {
        const { city, address } = parseLocation(doctor.location);
        if (city) {
          cities.push(city);
          doctor.city = city;
          doctor.address = address;
        }
        delete doctor.location;
      }

      doctor.phone = formatPhoneNumber(doctor.phone) || '-';

      if (doctor.specialty) {
        doctor.specialty.split(/\s*,\s*/).forEach((spec) => {
          const trimmed = spec.trim();
          if (trimmed.length > 0) {
            specialties.push(trimmed);
          }
        });
      }
    });

    return { doctors, cities, specialties };
}

async function uploadToFirebase(doctors, cities, specialties) {
    const batch = db.batch();

    const uniqueCities = [...new Set(cities)];
    uniqueCities.forEach((city) => {
      const docRef = db.collection('areas').doc(city);
      batch.set(docRef,{name: city,createdAt: new Date(),},{ merge: true });
    });

    const specialtyMap = new Map();
    specialties.forEach((spec) => {
      const normalized = spec.trim().toLowerCase();
      if (!specialtyMap.has(normalized)) {
        specialtyMap.set(normalized, spec.trim());
      }
    });

    Array.from(specialtyMap.values()).forEach((spec) => {
      const docRef = db.collection('doctor_spec').doc(spec);
      batch.set(docRef,{name: spec, createdAt: new Date(),},{ merge: true });
    });

    doctors.forEach((doctor) => {
      const docRef = db.collection('doctors').doc();
      batch.set(docRef, {
        ...doctor,
        createdAt: new Date(),
      });
    });

    await batch.commit();
  
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
    let allDoctors = [];
    let allCities = [];
    let allSpecialties = [];

    for (let pageNum = 1; pageNum <= 4/*382*/; pageNum++) {
      const { doctors, cities, specialties } = await scrapeDoctors(browser, pageNum);

      allDoctors.push(...doctors);
      allCities.push(...cities);
      allSpecialties.push(...specialties);

      await delay(1500 + Math.random() * 2000);
    }

    const uniqueCities = [...new Set(allCities)];
    const specialtyMap = new Map();
    allSpecialties.forEach((spec) => {
      const normalized = spec.trim().toLowerCase();
      if (!specialtyMap.has(normalized)) {
        specialtyMap.set(normalized, spec.trim());
      }
    });

    if (allDoctors.length > 0) {
      await uploadToFirebase(allDoctors, uniqueCities, Array.from(specialtyMap.values()));
    }
})();
