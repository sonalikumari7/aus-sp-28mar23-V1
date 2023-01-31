import './App.css';
import ViewTabs from './components/ViewTabs/ViewTabs';
import { useEffect, useState } from 'react';
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'

/**
 * @returns This is totally Functional Hook based application.
 * This is main component to run react js application
 */

/**
 * @returns To run and development mode Please comment 
 */

function App() {

  const [dataikuValue, setDataikuValue] = useState(undefined)

  /**
   * This function running only for DSS server because dss server took some time open
      and before opening it doesn't get dataiku defaultAPI key. To get API key we need wait few seconds
      so that purpose we wait and set default API key with the help of state function setDataikuValue
   */

  useEffect(() => {
    setTimeout(() => {
      // setDataikuValue(window.dataiku.defaultAPIKey)
      setDataikuValue("testingOnLocal") // comment this line for deploying on DSS and uncomment the above one.
    }, 1000);

  }, [])



  return (
    <div className="App">

      {
        dataikuValue === undefined ? (<span>Loading...</span>) : (<ViewTabs />)
      }

      {/* <ViewTabs /> */}
    </div>
  );
}

export default App;
