import dotenv from 'dotenv'
import fs from 'fs'
import { Octokit, App } from 'octokit'

// Load environment variables from .env file
dotenv.config()

// Set configured values
const appId = process.env.APP_ID
const privateKeyPath = process.env.PRIVATE_KEY_PATH
const privateKey = fs.readFileSync(privateKeyPath, 'utf8')
const enterpriseHostname = process.env.ENTERPRISE_HOSTNAME
const issueTitle = 'API Test Issue'
const issueBody = fs.readFileSync('./message.md', 'utf8')

// Hardcoded repository information
const owner = 'Solara6'
const repo = 'astra'

// Create an authenticated Octokit client authenticated as a GitHub App
const app = new App({
  appId,
  privateKey,
  ...(enterpriseHostname && {
    Octokit: Octokit.defaults({
      baseUrl: `https://${enterpriseHostname}/api/v3`
    })
  })
})

// Main function to run our app
async function main() {
  try {
    // Get the authenticated app's name
    const { data } = await app.octokit.request('/app')
    
    // Get an installation access token for the specified repository owner
    const installation = await app.octokit.rest.apps.getRepoInstallation({
      owner,
      repo
    })
    
    // Create an Octokit instance for the installation
    const octokit = await app.getInstallationOctokit(installation.data.id)
    
    // Create an issue in the repository
    const issue = await octokit.rest.issues.create({
      owner,
      repo,
      title: issueTitle,
      body: issueBody
    })
    
    console.log(`Created issue #${issue.data.number}: ${issue.data.title}`)
    

    
  } catch (error) {
    if (error.response) {
      console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`)
    } else {
      console.error(error)
    }
  }
}

// Run the main function
main().catch(error => {
  console.error('Failed to run the app:', error)
})
