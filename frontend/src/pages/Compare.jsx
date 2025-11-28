import React, { useState } from "react";
import axios from "axios";

export default function Compare() {
  const [idealFile, setIdealFile] = useState(null);
  const [inputFile, setInputFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleCompare = async () => {
    const formData = new FormData();
    formData.append("ideal_file", idealFile);  // MATCH BACKEND
    formData.append("input_file", inputFile);  // MATCH BACKEND

    const res = await axios.post(
      "http://localhost:8000/api/compare/termsheets",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    console.log("COMPARE RESP:", res.data);

    setResult(res.data.comparison); // THIS HAS ideal_fields, input_fields, differences
  };

  const statusColor = {
    same: "bg-green-100 text-green-700 border-green-300",
    changed: "bg-red-100 text-red-700 border-red-300",
    missing_in_input: "bg-yellow-100 text-yellow-700 border-yellow-300",
    extra_in_input: "bg-blue-100 text-blue-700 border-blue-300",
    not_found_in_both: "bg-gray-100 text-gray-700 border-gray-300",
  };

  const highlight = (text, status) => {
    if (!text) return "—";
    return (
      <span className={`px-1 rounded border ${statusColor[status]}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Compare Two Term Sheets</h2>

      {/* Upload boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-5 border rounded-xl bg-white shadow">
          <h3 className="font-semibold mb-2">Upload Ideal Term Sheet</h3>
          <input type="file" accept="application/pdf"
            onChange={(e) => setIdealFile(e.target.files[0])}/>
        </div>

        <div className="p-5 border rounded-xl bg-white shadow">
          <h3 className="font-semibold mb-2">Upload Term Sheet to Validate</h3>
          <input type="file" accept="application/pdf"
            onChange={(e) => setInputFile(e.target.files[0])}/>
        </div>
      </div>

      <button
        onClick={handleCompare}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
      >
        Compare
      </button>

      {/* SHOW TABLE + BOXES ONLY IF RESULT EXISTS */}
      {result && result.differences && (
        <>
          {/* TABLE BLOCK */}
          <div className="mt-10 p-6 bg-white rounded-xl shadow border">
            <h3 className="text-xl font-semibold mb-4">Comparison Results</h3>

            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Field</th>
                  <th className="px-4 py-2 border">Ideal</th>
                  <th className="px-4 py-2 border">Input</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>

              <tbody>
                {Object.entries(result.differences).map(([field, data]) => (
                  <tr key={field} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 border capitalize">
                      {field.replace(/_/g, " ")}
                    </td>

                    <td className="px-4 py-2 border">
                      {data.ideal || "—"}
                    </td>

                    <td className="px-4 py-2 border">
                      {data.input || "—"}
                    </td>

                    <td className="px-4 py-2 border">
                      <span className={`px-3 py-1 rounded-full border text-sm font-medium ${statusColor[data.status]}`}>
                        {data.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* HIGHLIGHTED TEXT PANELS */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ideal highlighted */}
            <div className="bg-white p-6 rounded-xl shadow border">
              <h3 className="text-lg font-semibold mb-3">Ideal Term Sheet (Highlighted)</h3>
              {Object.entries(result.differences).map(([field, data]) => (
                <p key={field} className="mb-2">
                  <strong className="capitalize">{field.replace(/_/g, " ")}:</strong>{" "}
                  {highlight(data.ideal, data.status)}
                </p>
              ))}
            </div>

            {/* Input highlighted */}
            <div className="bg-white p-6 rounded-xl shadow border">
              <h3 className="text-lg font-semibold mb-3">Input Term Sheet (Highlighted)</h3>
              {Object.entries(result.differences).map(([field, data]) => (
                <p key={field} className="mb-2">
                  <strong className="capitalize">{field.replace(/_/g, " ")}:</strong>{" "}
                  {highlight(data.input, data.status)}
                </p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
