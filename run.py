# Script for setting up and running an instance locally. This script will start and monitor both the server and the
# web app, setting it up so that both will monitor for filesystem changes and recompile themselves as nessecary.

import argparse
import os
import subprocess
import threading
import time

argParser = argparse.ArgumentParser()
argParser.add_argument("-d", "--datadir", help="Data directory.")
args = argParser.parse_args()

# Root directory of the project (i.e. directory where this script resides)
rootDir = os.path.dirname(os.path.realpath(__file__))


# Some helpers for coloring our output.
class bcolors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def runServer():
  cmd = ["go", "run", "."]
  cwd = os.path.join(rootDir, "server")
  env = os.environ.copy()
  env['DATA_DIR'] = args.datadir
  return subprocess.Popen(cmd, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)


def serverThreadProc(p):
  """Runs the server"""
  with p.stdout:
    for line in iter(p.stdout.readline, b''):
      text = line.decode('utf-8').strip()
      if "[ERROR]" in text:
        text = f"{bcolors.RED}{text}{bcolors.ENDC}"
      elif "[WARNING]" in text:
        text = f"{bcolors.YELLOW}{text}{bcolors.ENDC}"
      print(f"{bcolors.GREEN}server{bcolors.ENDC} : {text}")


serverProcess = runServer()
serverThread = threading.Thread(target=serverThreadProc, args=(serverProcess,))
serverThread.start()

print("Press Ctrl+C to exit")
try:
  while True:
    time.sleep(1)
    if not serverThread.is_alive():
      serverProcess.wait()
      print(f"{bcolors.YELLOW}Server exited with code {serverProcess.returncode}, exiting.{bcolors.ENDC}")
      break
except KeyboardInterrupt:
  print("Exiting...")
  serverProcess.kill()
