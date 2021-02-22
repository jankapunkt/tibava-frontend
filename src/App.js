import logo from './logo.svg';
import './App.css';
import AnalysisViewer from "./components/analysisViewer";

function App() {
  return (
   <div class="">
      <div class="header">
        <h2>Audio Video Analysis</h2>
      </div>
      <div>
        <AnalysisViewer/>
      </div>
      <div class="footer">
        <p>Footer Notes</p>
      </div>
   </div>
  );
}

export default App;
