import FileSaver from "file-saver";
import React from "react";
import { useMeasure } from "react-use";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getPngData } from "recharts-to-png";
import { CSVLink, CSVDownload } from "react-csv";
export const FaceAnalysisGraph = (args) => {

  const [containerRef, { width: containerWidth }] = useMeasure();
  // The chart that we want to download the PNG for.
  const [chart, setChart] = React.useState();

  const handleDownloadPNG = React.useCallback(async () => {
    // Send the chart to getPngData
    const pngData = await getPngData(chart);
    // Use FileSaver to download the PNG
    FileSaver.saveAs(pngData, "videofaceanalysis.png");
  }, [chart]);
   const handleDownloadCSV = React.useCallback(async () => {
    console.log("chart object: ")
    console.log(chart)
    // Send the chart to getPngData
    const pngData = await getPngData(chart);
    // Use FileSaver to download the PNG
    FileSaver.saveAs(pngData, "videofaceanalysis.png");
  }, [chart]);

  const colorschemes = ["#C49500","#060606","#0F7800","#AF1F00","#7B7878","#C49500","#588A00","#0F7800","#007245","#008F91","#004091","#040091","#420091","#7F0091","#91004B","#910025","#317A9A"];

  var data = args.faceAreaArrForGraph;
  function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
    return color;
    }
    function getMultiLineForGraph(data) {
        var multiLineForGraph = '';
        var allKeys = Object.keys(data[0]);
        for (var i = 1; i < allKeys.length; i++) {
        multiLineForGraph = multiLineForGraph+'<Line type="monotone" dataKey="'+allKeys[i]+'" stroke="'+colorschemes[i]+'"/> '
        }
    };

  var multiLineForGraph = [];
        var allKeys = Object.keys(data[0]);
        for (var i = 1; i < allKeys.length; i++) {
            multiLineForGraph.push(<Line type="monotone" dataKey={allKeys[i]} stroke={colorschemes[i]} />);
        }
  return (
        <>
          <LineChart
            ref={(ref) => setChart(ref)} // Set target element
            data={data}
            height={300}
            width={700}
          >
            <XAxis dataKey="frameNum" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend wrapperStyle={{ bottom: -5 }} />
            {multiLineForGraph}
          </LineChart>
          <span style={{ float: 'left' }}>
            <button className="btn-stl bg-cb-bl" onClick={handleDownloadPNG}>Download as PNG</button>
          </span>
          <span style={{ float: 'right' }}>
          <CSVLink  className="btn-stl bg-cb-bl" data={data} filename={"face-detections.csv"}>Download CSV</CSVLink> </span>
        </>
  );
};

export default FaceAnalysisGraph;
