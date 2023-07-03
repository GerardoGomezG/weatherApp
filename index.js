const apiLocationURL = 'https://geocoding-api.open-meteo.com/v1/search?name=';
// Full URL format: https://geocoding-api.open-meteo.com/v1/search?name=Paterson&count=10&language=en&format=json

const apiUrl = 'https://api.open-meteo.com/v1/forecast?';
// Full URL format: https://api.open-meteo.com/v1/forecast?latitude=10.11&longitude=-68.09&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&start_date=2023-06-27&end_date=2023-07-01&timezone=auto

const numberOfDays = 5;
const imgHeightWidth = 200;
const cityInput = document.querySelector('input');
const btn = document.querySelector('button');
const container = document.querySelector('#daysContainer');
const cityTitle = document.querySelector('h2');
const template = document.querySelector('template').content;
const fragment = document.createDocumentFragment();

async function getWeather(city, lat, lon) {
  // Getting start (current) date
  const currentDate = new Date();
  const sYear = currentDate.getFullYear();
  const sMonth = (currentDate.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2 });
  // getMonth() returns values 0...11, so it needs to be increased by 1 to get current month number
  // Weather API requires date format: YYYY-MM-DD. That's why 2 minimimIntegerDigits is set
  const sDate = currentDate.getDate().toLocaleString('en-US', { minimumIntegerDigits: 2 });
  const startFullDate = `${sYear}-${sMonth}-${sDate}`;

  const endDate = new Date();
  endDate.setDate(currentDate.getDate() + numberOfDays - 1); // Adds 4 days
  const eYear = endDate.getFullYear();
  const eMonth = (endDate.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2 });
  // getMonth() returns values 0...11, so it needs to be increased by 1 to get current month number
  // Weather API requires date format: YYYY-MM-DD. That's why 2 minimimIntegerDigits is set
  const eDate = endDate.getDate().toLocaleString('en-US', { minimumIntegerDigits: 2 });
  const endFullDate = `${eYear}-${eMonth}-${eDate}`;

  // Weather API call
  const weatherResponse = await fetch(`${apiUrl}latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&start_date=${startFullDate}&end_date=${endFullDate}&timezone=auto`);
  const weatherData = await weatherResponse.json();
  const dailyWeatherData = weatherData.daily;
  const dailyTime = dailyWeatherData.time;
  const dailyCode = dailyWeatherData.weathercode;
  const dailyMaxTemp = dailyWeatherData.temperature_2m_max;
  const dailyMinTemp = dailyWeatherData.temperature_2m_min;
  let day;

  cityTitle.innerHTML = city;
  for (let i = 0; i < numberOfDays; i += 1) {
    let src;
    let alt;
    const dayNumber = new Date(dailyTime[i]).getDay();
    switch (dayNumber) {
      case 0:
        day = 'Monday';
        break;
      case 1:
        day = 'Tuesday';
        break;
      case 2:
        day = 'Wednesday';
        break;
      case 3:
        day = 'Thursday';
        break;
      case 4:
        day = 'Friday';
        break;
      case 5:
        day = 'Saturday';
        break;
      default:
        day = 'Sunday';
    }
    switch (dailyCode[i]) {
      case 0:
      case 1: // Clear sky or mainly clear
        src = './assets/weatherCodeIcons/clear-day.svg';
        alt = 'Clear day';
        break;
      case 2: // Partly cloudy
        src = './assets/weatherCodeIcons/cloudy.svg';
        alt = 'Partly cloudy';
        break;
      case 3: // Overcast
        src = './assets/weatherCodeIcons/overcast-day.svg';
        alt = 'Overcast';
        break;
      case 45:
      case 48: // Fog
        src = './assets/weatherCodeIcons/fog.svg';
        alt = 'Fog';
        break;
      case 51:
      case 56: // Light drizzle
        src = './assets/weatherCodeIcons/drizzle.svg';
        alt = 'Light drizzle';
        break;
      case 53: // Moderate drizzle
        src = './assets/weatherCodeIcons/overcast-drizzle.svg';
        alt = 'Moderate drizzle';
        break;
      case 55:
      case 57: // Dense drizzle
        src = './assets/weatherCodeIcons/extreme-drizzle.svg';
        alt = 'Dense drizzle';
        break;
      case 61:
      case 66:
      case 80: // Slight rain
        src = './assets/weatherCodeIcons/rain.svg';
        alt = 'Slight rain';
        break;
      case 63:
      case 81: // Moderate rain
        src = './assets/weatherCodeIcons/overcast-rain.svg';
        alt = 'Moderate rain';
        break;
      case 65:
      case 67:
      case 82: // Heavy rain
        src = './assets/weatherCodeIcons/extreme-rain.svg';
        alt = 'Heavy rain';
        break;
      case 71:
      case 85: // Slight snow fall
        src = './assest/weatherCodeIcons/snow.svg';
        alt = 'Slight snow fall';
        break;
      case 73:
      case 75:
      case 86: // Moderate or heavy snow fall
        src = './assets/weatherCodeIcons/extreme-snow.svg';
        alt = 'Heavy snow fall';
        break;
      case 77: // Snow grains
        src = './assets/weatherCodeIcons/hail.svg';
        alt = 'Snow grains';
        break;
      case 95: // Thunderstorm: Slight or moderate
        src = './assets/weatherCodeIcons/thunderstorms.svg';
        alt = 'Thunderstorm: Slight or moderate';
        break;
      case 96:
      case 99: // Thunderstorm with slight or heavy hail
        src = './assets/weatherCodeIcons/thunderstorms-extreme-rain.svg';
        alt = 'Thunderstorm with slight or heavy hail';
        break;
      default:
        src = '';
        alt = 'not set';
    }
    template.querySelector('h4').textContent = day;
    template.querySelector('.weatherImage').setAttribute('src', src);
    template.querySelector('.weatherImage').setAttribute('alt', alt);
    template.querySelector('.weatherImage').setAttribute('height', `${imgHeightWidth}px`);
    template.querySelector('.weatherImage').setAttribute('width', `${imgHeightWidth}px`);
    template.querySelector('#maxTemp').textContent = `${dailyMaxTemp[i]}°C`;
    template.querySelector('#minTemp').textContent = `${dailyMinTemp[i]}°C`;
    const clone = document.importNode(template, true);
    fragment.appendChild(clone);
  }
  container.appendChild(fragment);
}

async function getLocationByCity(givenCity) {
  const locationResponse = await fetch(apiLocationURL + givenCity);
  const locationData = await locationResponse.json();
  const city = locationData.results[0].name; // City name
  const lat = locationData.results[0].latitude;
  const lon = locationData.results[0].longitude;
  getWeather(city, lat, lon);
}

async function getLocationByIPAddress(ipAdress) {
  const ipLocationResponse = await fetch(`https://ip-api.com/json/${ipAdress}`);
  const ipLocationData = await ipLocationResponse.json();
  const { city } = ipLocationData;
  const { lat } = ipLocationData;
  const { lon } = ipLocationData;
  getWeather(city, lat, lon);
}

btn.addEventListener('click', () => {
  if (cityInput.value.trim().length > 1) {
    container.replaceChildren();
    getLocationByCity(cityInput.value.trim());
  }
});

cityInput.addEventListener('keypress', (e) => {
  if ((e.key === ' ') && (cityInput.value.length < 1)) e.preventDefault();
  else if ((cityInput.value.trim().length > 1) && (e.key === 'Enter')) {
    container.replaceChildren();
    getLocationByCity(cityInput.value.trim());
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const ipInfoResponse = await fetch('https://api.ipify.org?format=json');
  const ipInfo = await ipInfoResponse.json();
  const ipAddress = await ipInfo.ip;
  getLocationByIPAddress(ipAddress);
});
