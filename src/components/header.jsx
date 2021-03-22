import React, { Component } from "react";
import tibavaLogo from './../media/tib_tibava_logo_opq.png';

class Header extends Component {
    constructor(props) {
        super(props)
      }

    render() {

        return (
            <div>
                <table border='0px' width="100%">
                    <tbody>
                        <tr>
                        <th width="20%" className="text-align-center"><img className="tibava-logo" src={tibavaLogo} alt="TIB-AV-A" /></th>
                        <th width="65%" className="text-align-center"><h2>Audio Video Analysis</h2>
                            <form class="search" action="">
                              <input type="text" placeholder="Search for publicly available analysis" name="search" />
                              <button type="submit"><i class="fa fa-search"></i> Search</button>
                            </form>
                        </th>
                        <th width="15%" className="text-align-left"></th>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Header;