import React, { useState } from "react";

const TreeFilter = ({ filteredData,setFilteredData, allData, setSelectedTree }) => {
  // Get all unique keys from the JSON array
  console.log("f",filteredData)
  const keys = ['ward', 'tname']; // Assuming the first element contains all keys

  const [selectedFilters, setSelectedFilters] = useState({}); // Initialize filters as an empty object
  

  const handleSelectKey = (event) => {
    const key = event.target.name;
    const value = event.target.value;

    // Update the selectedFilters object with the selected key and value
    let filters= { ...selectedFilters, [key]: value };
    if(key == "ward") {
      delete filters["tname"]
    }
    
    let filtered = allData;

    for (const key in filters) {
      if (filters[key]) {
        filtered = filtered.filter(
          (tree) => tree[key] === filters[key]
        );
      }
    }

    setFilteredData(filtered);
    setSelectedTree(undefined)
    setSelectedFilters(filters)

    var dropdown = document.getElementById('ward-dropdown');
    var selectedValue = dropdown.value;
    for (var i = 0; i < dropdown.options.length; i++) {
      if (dropdown.options[i].value === '' && selectedValue !== '') {
        dropdown.options[i].disabled = true;
      }
    }
  };


  return (
    <div>
      <div className="select-wrapper">
        <h3>Ward</h3>
      <select className="select" id="ward-dropdown"
          key={"ward"}
          name={"ward"}
          // value={selectedFilters[key] || ""}
          onChange={handleSelectKey}
        >
           <option value="" >All</option>
          {[...new Set(allData.map((tree) => tree['ward']))].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        </div>

        <div className="select-wrapper">
          <h3>Tree Name</h3>
        <select className="select"
          key={'tname'}
          name={'tname'}
          value={selectedFilters['tname'] || ""}
          onChange={handleSelectKey}
        >
          <option value="">All</option>
          {[...new Set(allData.filter(tree => (!selectedFilters["ward"] || selectedFilters["ward"] == tree["ward"])).map((tree) => tree['tname']))].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        </div>
      {/* <h2>Filtered Tree Data:</h2>
      <ul>
        {filteredData.map((tree, index) => (
          <li key={index}>{JSON.stringify(tree)}</li>
        ))}
      </ul> */}
    </div>
  );
};

export default TreeFilter;
