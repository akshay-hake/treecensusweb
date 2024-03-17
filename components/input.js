import React from "react";
import * as XLSX from "xlsx";

export default function CSVinput() {
  const onChange = (e) => {
    const [file] = e.target.files;
    const reader = new FileReader();

    reader.onload = (evt) => {
      console.log("hello....")
      const bstr = evt?.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_csv(ws,{ FS : ",", RS : "|"});
      const records = data.split("|");
      
      console.log(data);
    };
    reader.readAsBinaryString(file);
  };
  return (
    <div>
      
      <input type="file" onChange={onChange} />
    </div>
  );
}