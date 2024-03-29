import React from 'react'
import Link from 'gatsby-link'

import './header.css'

class Header extends React.Component {
  render() {
    return (
      <div className="header">
        <Link
          to="/"
          className="logo"
        >
          J<span>eff </span>W<span>olff</span>
        </Link>

        <ul className="navigation">
          <li><Link to="/work/">Work</Link></li>
          <li><Link to="/notes/">Notes</Link></li>
          <li><a href="mailto:hi@jeffwolff.net">Contact</a></li>
        </ul>

      </div>
    )
  }
}

export default Header
