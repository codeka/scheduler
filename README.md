# scheduler
A web app for scheduling shifts

## Requirements

Requiremenst for the python build/install scripts:

    python -m pip install -U watchdog

Requirements for server:

    $ go version
    go version go1.23.11

Requirements for web:

    $ npm --version
    9.8.1

    $ cd web
    $ npm install

## Running locally

    python ./run.py --datadir=/some/path --twilio=ACCOUNT_SID:AUTH_TOKEN --sendgrid=API_KEY

## Deploying

Builds the app and copies scheduler.zip to the 'scpdest' server

    python ./deploy.py --scpdest=user@server:/path

