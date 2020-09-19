const chalk = require('chalk')

const handleSetupError = async (promise, explanation) => {
  return promise
    .then((data) => {
      console.log(`   ${chalk.green('[ Executed ]')} ${explanation}`)
      return data
    })
    .catch((error) => {
      if (error && error.message === 'instance already exists') {
        console.log(
          `   ${chalk.yellow('[ Skipped ]')}  ${explanation} (already exists)`
        )
      } else {
        console.log(
          `   ${chalk.red('[ Failed ]')}   ${explanation}, with error: ${error}`
        )
      }
    })
}

export { handleSetupError }
