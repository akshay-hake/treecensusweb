import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./places";
import Distance from "./distance";
import TreeFilter from "./TreeFilter";
import React from "react";
import * as XLSX from "xlsx";
import { get } from "https";
// import {app, db, getDocs} from "./FirebaseConfig"
// import { collection } from 'firebase/firestore/lite';


export default function TMap(props) {
  const [allData, setAllData] = useState();
  const [directions, setDirections] = useState();
  const [points, setPoints] = useState();
  const [selectedTree, setSelectedTree] = useState();
  const [treeMap, setTreeMap] = useState({});
  const [grouped, setGrouped] = useState(true);
  const [filteredData, setFilteredData] = useState();
  const [isFiltered, setIsFiltered] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 43.45, lng: -80.49 });
  const mapRef = useRef();
  const center = useMemo(() => ({ lat: 43.45, lng: -80.49 }), []);
  const options = useMemo(
    () => ({
      mapId: "b181cac70f27f5e6",
      disableDefaultUI: false,
      clickableIcons: false,
    }),
    []
  );

  const onLoad = useCallback((map) => (mapRef.current = map), []);

  const icon = {
    url: "/images/tree-icon.png",
    scaledSize: new google.maps.Size(50, 50),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(0, 0),
  };

  const updateData = (data) => {
    setFilteredData(data);
    setIsFiltered(true);
  };

  useEffect(() => {
    let i = 0;
    let map = {};
    let pts = [];
    let tdata = [];

    for (i = 0; i < props.data.length; i++) {
      let d = props.data[i]

      if (d["lat"] && d["lon"]) {

        let detail = {
          ward: d['Ward'],
          sno: d["sno"],
          tname: d["TreeName"],
          height: d["height"],
          age: d["age"],
          lat: d["lat"],
          lng: d["lon"],
        };

        tdata.push({
          ...detail

        });

        // let key = "" + d["lat"] + ";" + d["lon"];
        // map = {
        //   ...map,
        //   [key]: detail,
        // };

        // pts.push({
        //   lat: d["lat"],
        //   lng: d["lon"],
        // });
      }
    }

    setFilteredData(tdata);
    setAllData(tdata)
    // setTreeMap(map);
    // setMapCenter(pts[0]);
    // setPoints(pts);
  }, [props.data])





  useEffect(() => {
    if (isFiltered) filter();
  }, [isFiltered]);

  const filter = () => {
    let map = {};
    let pts = [];
    filteredData?.forEach((d) => {
      let detail = {
        ward: d['ward'],
        sno: d["sno"],
        tname: d["tname"],
        height: d["height"],
        age: d["age"],
        lat: d["lat"],
        lng: d["lng"],
      };
      let key = "" + d["lat"] + ";" + d["lng"];
      map = {
        ...map,
        [key]: detail,
      };

      pts.push({
        lat: d["lat"],
        lng: d["lng"],
      });
    });

    setTreeMap(map);
    setMapCenter(pts[0]);
    setPoints(pts);
    setIsFiltered(false);
  };

  const onChange = (e) => {
    const [file] = e.target.files;
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt?.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_csv(ws, { FS: ",", RS: "|" });
      const records = data.split("|");
      let i = 0;
      let map = {};
      let pts = [];
      let tdata = [];

      for (i = 1; i < records.length; i++) {
        let fields = records[i].split(",");
        let detail = {
          sno: fields[1],
          tname: fields[3],
          height: fields[8],
          age: fields[9],
          lat: Number(fields[5]),
          lng: Number(fields[6]),
        };

        tdata.push({
          ...detail,

        });

        let key = "" + Number(fields[5]) + ";" + Number(fields[6]);
        map = {
          ...map,
          [key]: detail,
        };

        pts.push({
          lat: Number(fields[5]),
          lng: Number(fields[6]),
        });
      }

      setFilteredData(tdata);
      setTreeMap(map);
      setMapCenter(pts[0]);
      setPoints(pts);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="container">
      <div className="controls">
        <div>

          {filteredData && filteredData?.length > 0 && (
            <TreeFilter filteredData={filteredData} setFilteredData={updateData} allData={allData} setSelectedTree={setSelectedTree} />
          )}
        </div>
        {selectedTree && <div class="card">
          <div class="card-item">
            <span class="detail-label">Age:</span>
            <span class="detail-value">{selectedTree.age}</span>
          </div>
          <div class="card-item">
            <span class="detail-label">Height:</span>
            <span class="detail-value">{selectedTree.height}</span>
          </div>
          <div class="card-item">
            <span class="detail-label">Latitude:</span>
            <span class="detail-value">{selectedTree.lat}4</span>
          </div>
          <div class="card-item">
            <span class="detail-label">Longitude:</span>
            <span class="detail-value">{selectedTree.lng}</span>
          </div>
          <div class="card-item">
            <span class="detail-label">Tree Name:</span>
            <span class="detail-value">{selectedTree.tname}</span>
          </div>
          <div class="card-item">
            <span class="detail-label">Ward:</span>
            <span class="detail-value">{selectedTree.ward}</span>
          </div>
        </div>}

        {directions && <Distance leg={directions.routes[0].legs[0]} detail={selectedTree} />}
      </div>
      <div className="map">
        <GoogleMap
          zoom={15}
          center={points && points?.length > 0 ? points[0] : center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >
          {console.log('Map is loaded')}
          {(<div>
            {points?.map((house) => (
              <div style={{ width: "50px" }}>
                <Marker
                  key={house.lat}
                  position={house}
                  icon={icon}
                  onClick={() => {
                    let TreeDetail = treeMap["" + house.lat + ";" + house.lng];
                    console.log(TreeDetail)
                    setSelectedTree(TreeDetail);
                  }}
                />
              </div>
            ))}
          </div>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

const generateHouses = (position) => {
  const _houses = [];
  for (let i = 0; i < 100; i++) {
    const direction = Math.random() < 0.5 ? -2 : 2;
    _houses.push({
      lat: position.lat + Math.random() / direction,
      lng: position.lng + Math.random() / direction,
    });
  }
  return _houses;
}
