[![Build Status](https://semaphoreapp.com/api/v1/projects/1d526ec2-ecb2-4a55-aecc-f63841f19c77/366041/badge.png)](https://semaphoreapp.com/fredy8/forum)      


Forum Website

Directory Layout
----------------
```
Template/
|-- angular-app/                # Angular application components
|   `-- css/
|   `-- js/
|       `-- app/                # Views and controllers separated by feature (The views here are statically served to the client).
|       `-- common/
|           `-- directives/     # Custom directives
|           `-- resources/      # Resources (ngResource)
|           `-- services/       # Services (consts, values, services, factories and providers)
|       `-- tests/
|           `-- conf/
|           `-- e2e/
|           `-- unit/
|-- api/                        # API components
|   `-- controllers/            # Modules which define the API functionality
|   `-- models/                 # DB models
|   `-- routes/                 # Contains route file which hook up routes with controllers
|       `-- main.js             # The main route, mounted to /api/
|   `-- tests/
|       `-- e2e
|       `-- unit
|-- node_modules/               # external modules used in the application
|-- public/                     # Statically served files
|   `-- bower_components/       # External front end components
|   `-- css/                    # App css (angular-app/css is bundled and minified to this directory, do NOT modify).
|   `-- img/                    # Statically served images and icons
|   `-- js/                     # App js (angular-app is bundled and minified to this directory, do NOT modify).
|   `-- index.html
|-- server/                     # Server related functionality
|-- .bowerrc                    # Bower options
|-- .csslintrc                  # css linting options
|-- .jshintrc                   # js linting options
|-- bower.json                  # Bower packages definition (front-end third party libraries)
|-- Gruntfile.js                # Grunt tasks definition (task automation)
|-- package.json                # Specifies project properties and dependencies
|-- README.md
|-- server.js                   # Node server
```

Prerequisites
-------------

1. Install git:
  `brew install git` or http://git-scm.com/
2. Install node and npm:
  `brew install node` or http://nodejs.org/
3. Install mongodb
  `brew install mongodb` or http://docs.mongodb.org/manual/installation/
4. Create database directory
  `sudo mkdir -p /data/db`

Installing
----------

1. Clone the repository:

  ```
  git clone git@github.com:fredy8/Forum.git [my_project_name]
  cd [my_project_name]
  ```
2. Install dependencies
  
  `sudo npm install`

  `sudo npm install -g grunt-cli`
  
  `sudo npm install -g bower`

Running
-------

1. Start the database
  `sudo mongod`
2. Start the server
  `npm start`

Testing
-------
  `npm test` (the server must be running)

This will first lint all javascript and css files, then run the tests in these order:

1. API tests using mocha
2. angular unit tests using karma
3. angular e2e tests using protractor

Developing
----------

1. Start the server. (The server is automatically restarted when changes are detected).
2. Run the watch script:
  `npm run watch`
   * Every time a file is modified it gets linted to find potential errors.
   * If there were no lint errors, the angular app is bundled and minified to be served statically.

Debugging
---------
### Backend
Install node inspector:
`sudo npm install node-inspector -g`

Run node inspector:
`node-inspector`

When the server is running, just go to http://localhost:8080/debug?port=5858.

### Frontend
In chrome, go to View -> Developer Tools

Deploying
---------
```
git checkout production
git rebase master
npm test                      # All tests must pass
git checkout master
git push origin production
```

After this, go into the server, pull the production branch and start the server.
TO DO: hook up the server to github to auto deploy.

