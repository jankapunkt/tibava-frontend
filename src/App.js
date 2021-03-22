import logo from './logo.svg';
import './App.css';
//import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
import AnalysisViewer from "./components/analysisViewer";
import Header from "./components/header";

function App() {
  return (
   <div className="">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
      <div className="header">
        <Header/>
      </div>
      <div>
        <AnalysisViewer/>
      </div>
      <div className="footer">
        <p>Footer Notes</p>
      </div>
   </div>
  );
}

export default App;
