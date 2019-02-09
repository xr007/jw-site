import React from 'react'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'

const NotFoundPage = () => (
    <div>
    <Helmet
      title={`⚠ Page Not Found`}
      >
    <body className="error-page"/>
    </Helmet>
        <div className="bs-wrapper">
            <div className="bs-content">
                <h1>The page cannot be found</h1>
                <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                <hr />
                <p>Please try the following:</p>
                <ul>
                    <li>If you typed the page address in the Address bar, make sure that it is spelled correctly.</li>
                    <li>Open the <Link to="/">jeffwolff.net</Link> home page, and then look for links to the information you want.</li>
                    <li>Click the <a href="javascript:window.history.back()">Back</a> button to try another link.</li>
                    <li>Click <a href="https://www.google.com/search?q=site%3Ajeffwolff.net" target="_blank">Search</a> to look for information on the Internet.</li>
                </ul>
                <p>HTTP 404 - File not found</p>
            </div>
        </div>
    </div>
)

export default NotFoundPage
