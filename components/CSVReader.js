import React, { useEffect, useState } from 'react';
import TMap from './TMap';
import { Pie } from 'react-chartjs-2';
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement } from 'chart.js'

Chart.register(ArcElement);

const Legend = ({ data }) => {
  return (
    <div style={{display:"ruby"}}>
      {data.labels.map((label, index) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', margin: '5px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: data.datasets[0].backgroundColor[index], marginRight: '5px' }}></div>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

const options = {
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed) {
            label += context.parsed.toFixed(2) + '%';
          }
          return label;
        }
      }
    }
  },
  custom: {
    labels: {
      visible: true,
      render: function(context) {
        const index = context.dataIndex;
        const value = context.dataset.data[index];
        const percent = (value / context.dataset.data.reduce((a, b) => a + b, 0)) * 100;
        return context.dataset.labels[index] + ': ' + value + ' (' + percent.toFixed(2) + '%)';
      },
      color: '#000',
      position: 'outside'
    }
  }
};

function CSVFileReader(props) {
  const [files, setFiles] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalRecords: 0,
    wardCounts: {},
    uniqueTrees: new Set(),
    totalCanopy: 0,
    wardCanopy: {},
  });
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [pieChartData, setPieChartData] = useState(undefined)

  const [selectedOption, setSelectedOption] = useState(props.user == "venviro" ? 'input' : "dashboard");

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  useEffect(() => {
    if (props.user != 'venviro') {
      handleGithubFiles()
    }
  }, [])

  const handleFileChange = async (e) => {
    const selectedFiles = e.target.files;
    const filePromises = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const wardNumber = file.name.match(/ward_(\d+)/);
      if (wardNumber) {
        const ward = wardNumber[1];
        const fileContent = await readFile(file);
        const parsedData = await parseCSV(fileContent, ward);
        filePromises.push(parsedData);
      }
    }

    const data = await Promise.all(filePromises);
    setFiles(selectedFiles);
    setTableData(data);
    calculateAnalytics(data);
    calculateTable(data)
  };

  const handleGithubFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://api.github.com/repos/akshay-hake/treecensusdata/contents/manwath');
      if (!response.ok) {
        throw new Error('Failed to fetch file list from GitHub');
      }
      const files = await response.json();

      const filePromises = files.map(async (file) => {
        if (file.type === 'file' && file.name.endsWith('.csv')) {
          const fileContent = await fetch(file.download_url);
          if (!fileContent.ok) {
            throw new Error(`Failed to fetch ${file.name} from GitHub`);
          }
          const text = await fileContent.text();
          const wardNumber = file.name.match(/ward_(\d+)/);
          if (!wardNumber) {
            throw new Error(`Failed to extract ward number from ${file.name}`);
          }
          const ward = wardNumber[1];
          const parsedData = await parseCSV(text, ward);
          return parsedData;
        } else {
          return null;
        }
      });

      const data = await Promise.all(filePromises.filter(promise => promise !== null));
      setTableData(data);
      calculateAnalytics(data);
      calculateTable(data);
      setLoading(false)
    } catch (error) {
      console.error('Error fetching and processing CSV files from GitHub:', error);
    }
  };


  const calculateTable = (data) => {
    const wardStats = {};
    data.forEach(wardData => {
      wardData.forEach(tree => {
        const wardNo = tree.Ward;
        const canopy = tree.Canopy || 0;
        const age = tree.age || "";

        // Initializing ward if not exists
        if (!wardStats[wardNo]) {
          wardStats[wardNo] = {
            totalTrees: 0,
            totalCanopy: 0,
            totalHeritageTrees: 0,
            uniqueTrees: new Set()
          };
        }

        // Incrementing tree count and canopy sum
        wardStats[wardNo].totalTrees++;
        wardStats[wardNo].totalCanopy += canopy;

        // Checking for heritage trees
        if (age.toLowerCase() === "heritage") {
          wardStats[wardNo].totalHeritageTrees++;
        }

        // Adding tree to unique trees set
        wardStats[wardNo].uniqueTrees.add(tree.TreeName);
      });
    });

    // Rendering table rows
    const rows = Object.keys(wardStats).map(wardNo => {
      const ward = wardStats[wardNo];
      return (
        <tr key={wardNo}>
          <td>{wardNo}</td>
          <td>{ward.totalTrees}</td>
          <td>{ward.totalCanopy.toFixed(2)}</td>
          <td>{ward.totalHeritageTrees}</td>
          <td>{ward.uniqueTrees.size}</td>
        </tr>
      );
    });

    const colors = [
      'red',
      'blue',
      'green',
      'orange',
      'purple',
      'yellow',
      'pink',
      'cyan',
      'magenta',
      'teal',
      'lime',
      'brown',
      'maroon',
      'navy',
      'olive',
      'grey',
      'indigo',
      'salmon',
      'turquoise',
      'lavender',
    ];

    const pdata = {
      labels: Object.keys(wardStats).map(s => ""+s),
      datasets: [{
        data: Object.keys(wardStats).map((wardNo, index) => wardStats[wardNo].totalTrees),
        backgroundColor: colors.slice(0, Object.keys(wardStats).length),
        hoverBackgroundColor: colors.slice(0, Object.keys(wardStats).length),
        labels: Object.keys(wardStats).map(s => ""+s),
      }],
      plugins: {
        labels: {
          render: "percentage",
          fontColor: ["green", "white", "red"],
          precision: 2
        },
      },
       text: "23%",
    };

    console.log(JSON.stringify(pdata))

    setPieChartData(pdata)

    setRows(rows)
  }





  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.readAsText(file);
    });
  };

  const parseCSV = (csvContent, ward) => {
    return new Promise((resolve) => {
      const rows = csvContent.split('\n');
      const headers = rows[0].split(',');
      const rowData = rows.slice(1).map((row) => {
        const values = row.split(',');
        const treeName = values[headers.indexOf('Tree Name')];
        const canopy = parseFloat(values[headers.indexOf('Canopy (sq. mtr)')]);
        analytics.uniqueTrees.add(treeName);
        const sno = values[headers.indexOf('Sr. No')]
        const lat = parseFloat(values[headers.indexOf('Latitude')]);
        const lon = parseFloat(values[headers.indexOf('Longitude')]);
        const height = parseFloat(values[headers.indexOf('Height (Ft)')]);
        const age = values[headers.indexOf('Age (Years)')];
        return { Ward: ward, TreeName: treeName, Canopy: canopy, sno: sno, lat: lat, lon: lon, height: height, age: age };
      });
      console.log("raw", rowData)
      resolve(rowData);
    });
  };

  const calculateAnalytics = (data) => {
    let totalRecords = 0;
    const wardCounts = {};
    let totalCanopy = 0;
    const wardCanopy = {};

    for (const fileData of data) {
      for (const row of fileData) {
        totalRecords++;
        const ward = row.Ward;
        wardCounts[ward] = (wardCounts[ward] || 0) + 1;
        if (row.Canopy) {
          totalCanopy += row.Canopy;
          wardCanopy[ward] = (wardCanopy[ward] || 0) + row.Canopy;
        }
      }
    }

    setAnalytics({
      ...analytics,
      totalRecords,
      wardCounts,
      totalCanopy,
      wardCanopy,
    });
  };

  return (
    loading ? <div className="load-wrapp">
      <div className="load-1">
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
    </div> : <div>
    <div className='dashboard-container'>
      
      <div className="nav-menu">
        {props.user == "venviro" && <div
          className={`nav-option ${selectedOption === 'input' ? 'selected' : ''}`}
          onClick={() => handleOptionClick('input')}
        >
          Input
        </div>}
        <div
          className={`nav-option ${selectedOption === 'dashboard' ? 'selected' : ''}`}
          onClick={() => handleOptionClick('dashboard')}
        >
          Dashboard
        </div>
        <div
          className={`nav-option ${selectedOption === 'map' ? 'selected' : ''}`}
          onClick={() => handleOptionClick('map')}
        >
          Map
        </div>

        <div
          className={`nav-option`}
          onClick={() => {}}
        >
          Report
        </div>

        <div
          className={`nav-option`}
          onClick={() => {}}
        >
          Tree Cutting
        </div>
      </div>
      <div>
        <div className="content">
        <h1 style={{textAlign:"center"}}>{props.user?.toUpperCase()} TREE CENSUS</h1>
          {selectedOption == 'input' && (
            <div className="dashboard-content">
              {/* Render your dashboard content here */}
              <div className="file-input-container">
                <label htmlFor="file-upload" className="file-input-label">
                  Choose CSV Files
                </label>
                <input
                  type="file"
                  id="file-upload"
                  accept=".csv"
                  className="file-input"
                  multiple
                  onChange={handleFileChange}
                />
              </div>
              {files.length > 0 && (
                <div className="uploaded-files">
                  <h2>Uploaded Files:</h2>
                  <ul className='file-names'>
                    {Array.from(files).map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {selectedOption === 'dashboard' &&
            <div className="dashboard-content">

              <h1 className='page-heading'>Dashboard</h1>

              {tableData.length > 0 && (
                <div>
                  <div className="analytics-container">
                    <div className="analytics-block">
                      <div className='grid-block'>
                        <div className='img-container'><img src={'/images/trees.jpg'} alt='Trees' /></div>
                        <div>
                          <h2 className="analytics-heading">Total Trees</h2>
                          <p className="analytics-item">{analytics.totalRecords}</p>
                        </div>

                      </div>
                    </div>

                    <div className="analytics-block">
                      <div className='grid-block'>
                        <div className='img-container'><img src={'/images/trees.jpg'} alt='Trees' /></div>
                        <div>
                          <h2 className="analytics-heading">Total Wards</h2>
                          <p className="analytics-item">{Object.entries(analytics.wardCounts).length}</p>
                          {/* <ul className="analytics-list">
                            {Object.entries(analytics.wardCounts).map(([ward, count]) => (
                              <li key={ward} className="analytics-list-item">
                                Ward {ward}: {count}
                              </li>
                            ))}
                          </ul> */}
                        </div>

                      </div>
                    </div>



                    <div className="analytics-block">
                      <div className='grid-block'>
                        <div className='img-container'><img src={'/images/trees.jpg'} alt='Trees' /></div>
                        <div>
                          <h2 className="analytics-heading">Total Canopy (sq.mtr)</h2>
                          <p className="analytics-item">{analytics.totalCanopy.toFixed(2)}</p>
                        </div>

                      </div>
                    </div>

                    <div className="analytics-block">
                      <div className='grid-block'>
                        <div className='img-container'><img src={'/images/trees.jpg'} alt='Trees' /></div>
                        <div>
                          <h2 className="analytics-heading">Total Heritage trees</h2>
                          <p className="analytics-item">{0}</p>
                          {/* <ul className="analytics-list">
                        {Object.entries(analytics.wardCanopy).map(([ward, canopy]) => (
                          <li key={ward} className="analytics-list-item">
                            Ward {ward}: {canopy}
                          </li>
                        ))}
                      </ul> */}
                        </div>

                      </div>
                    </div>

                    <div className="analytics-block">
                      <div className='grid-block'>
                        <div className='img-container'><img src={'/images/trees.jpg'} alt='Trees' /></div>
                        <div>
                          <h2 className="analytics-heading">Unique Tree Counts</h2>
                          <p className="analytics-item">{analytics.uniqueTrees.size}</p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "50% 45%", gap: "5%" }}>
                <div className='wards_stats'>
                  <h3 className='table-heading'>Ward-wise stats</h3>
                  <table className='table-scroll small-first-col'>
                    <thead>
                      <tr>
                        <th>Ward No</th>
                        <th>Total Trees</th>
                        <th>Sum of Canopy</th>
                        <th>Sum of Heritage Trees</th>
                        <th>Sum of Unique Trees</th>
                      </tr>
                    </thead>
                    <tbody className='body-half-screen'>
                      {rows}
                    </tbody>
                  </table></div>

                <div>
                  <h3 className='table-heading' style={{ textAlign: "center" }}>Graph</h3>
                  <div style={{ height: "70%", display:"flex", justifyContent:"center" }}>
                    {pieChartData && (
                      <div>
                        <div style={{display:"flex", justifyContent:"center", height:"110%"}}>
                       <Doughnut
                       data={pieChartData}
                       options={{
                         
                         elements: {
                           
                           center: {
                             legend: { display: true, position: "right" },
                             text: "Red is 2/3 the total numbers",
                             color: "#FF6384", // Default is #000000
                             fontStyle: "Arial", // Default is Arial
                             sidePadding: 20, // Default is 20 (as a percentage)
                             minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                             lineHeight: 25 // Default is 25 (in px), used for when text wraps
                           }
                         },
                         
                       }}
                     />
                     </div>
                     <Legend data={pieChartData} />
                     </div>
                    )}
                  </div>
                </div>
              </div>
            </div>}

          {selectedOption === 'map' && (
            <div className="map-content">
              {/* Render your map content here */}
              <TMap data={tableData.flat()} />
            </div>
          )}
        </div>
        {/* <input type="file" accept=".csv" multiple onChange={handleFileChange} /> */}

      </div>
      <img className="logout-btn" src="/images/logout.png" onClick={() => {
        localStorage.removeItem("loginuser")
        window.location.reload()
      }}></img>
    </div>
    </div>
  );
}

export default CSVFileReader;
