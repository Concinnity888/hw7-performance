function quantile(arr, q) {
  const sorted = arr.sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sorted[base + 1] !== undefined) {
      return Math.floor(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
  } else {
      return Math.floor(sorted[base]);
  }
};

function prepareData(result) {
  return result.data.map(item => {
    item.date = item.timestamp.split('T')[0];

    return item;
  });
}

// показать значение метрики за несколько день
function showMetricByPeriod(data, page, name, startDate, finishDate) {
  console.log(`All metrics for period ${startDate}-${finishDate}:`);
  const timestampStartDate = new Date(startDate).getTime();
  const timestampFinishDate = new Date(finishDate).getTime();

  const filteredData = data.filter(
    item => {
      const timestampCurrentDate = new Date(item.date).getTime();
      return item.page === page && item.name === name && timestampCurrentDate >= timestampStartDate && timestampCurrentDate <= timestampFinishDate;
    }
  );

  let table = {};
  filteredData.forEach((item, idx) => {
    table[idx] = {
      name: item.name,
      value: item.value,
      date: item.date
    };
  });

  console.table(table);
}

// показать сессию пользователя
function showSession(data, id) {
  console.log(`Session #${id}:`);
  const filteredData = data.filter(item => item.requestId === id);
  const table = {};

  filteredData.forEach((item, idx) => {
    table[idx] = {
      name: item.name,
      value: item.value,
      date: item.date
    };
  });

  console.table(table);
}

// сравнить метрику в разных срезах
function compareMetric(data, metric1, metric2) {
  console.log(`Compare ${metric1} and ${metric2}:`);
  const filteredDataMetric1 = data.filter(item => item.name === metric1).map(item => item.value);
  const filteredDataMetric2 = data.filter(item => item.name === metric2).map(item => item.value);
  const table = {};

  table[metric1] = {
    hits: filteredDataMetric1.length,
    p25: quantile(filteredDataMetric1, 0.25),
    p50: quantile(filteredDataMetric1, 0.5),
    p75: quantile(filteredDataMetric1, 0.75),
    p95: quantile(filteredDataMetric1, 0.95)
  }

  table[metric2] = {
    hits: filteredDataMetric2.length,
    p25: quantile(filteredDataMetric2, 0.25),
    p50: quantile(filteredDataMetric2, 0.5),
    p75: quantile(filteredDataMetric2, 0.75),
    p95: quantile(filteredDataMetric2, 0.95)
  }

  console.table(table);
}

function showMetricsByPlatform(data, platform) {
  console.log(`All metrics for ${platform}:`);

  const filteredData = data.filter(item => item.additional.platform === platform);
  const table = {};

  filteredData.forEach((item, idx) => {
    table[idx] = {
      name: item.name,
      value: item.value,
      date: item.date
    };
  });

  console.table(table);
}

function showMetricsByBrowser(data, browser) {
  console.log(`All metrics for ${browser}:`);
  const filteredData = data.filter(item => item.additional.browser === browser);
  const table = {};

  filteredData.forEach((item, idx) => {
    table[idx] = {
      name: item.name,
      value: item.value,
      date: item.date
    };
  });

  console.table(table);
}

// добавить метрику за выбранный день
function addMetricByDate(data, page, name, date) {
  let sampleData = data
          .filter(item => item.page == page && item.name == name && item.date == date)
          .map(item => item.value);

  let result = {};

  result.hits = sampleData.length;
  result.p25 = quantile(sampleData, 0.25);
  result.p50 = quantile(sampleData, 0.5);
  result.p75 = quantile(sampleData, 0.75);
  result.p95 = quantile(sampleData, 0.95);

  return result;
}

// рассчитывает все метрики за день
function calcMetricsByDate(data, page, date) {
  console.log(`All metrics for ${date}:`);

  let table = {};
  table.connect = addMetricByDate(data, page, 'connect', date);
  table.ttfb = addMetricByDate(data, page, 'ttfb', date);
  table.fcp = addMetricByDate(data, page, 'fcp', date);
  table.cls = addMetricByDate(data, page, 'cls', date);
  table.resource = addMetricByDate(data, page, 'resource', date);

  console.table(table);
};

fetch('https://shri.yandex/hw/stat/data?counterId=66868068-55f4-432f-af2f-0317c8b640a3')
  .then(res => res.json())
  .then(result => {
    let data = prepareData(result);

    calcMetricsByDate(data, 'map', '2021-11-01');
    showSession(data, '677008391515');
    showMetricByPeriod(data, 'map', 'fcp', '2021-10-31', '2021-11-02');
    showMetricsByPlatform(data, 'touch');
    showMetricsByBrowser(data, 'Chrome');
    compareMetric(data, 'fcp', 'cls');
  });
