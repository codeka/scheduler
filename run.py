# Script for setting up and running an instance locally. This script will start and monitor both the server and the
# web app, setting it up so that both will monitor for filesystem changes and recompile themselves as nessecary.

import argparse
import os
import signal
import subprocess
import threading
import time
from watchdog.observers import Observer
from watchdog.events import LoggingEventHandler

argParser = argparse.ArgumentParser()
argParser.add_argument("-d", "--datadir", help="Data directory.")
args = argParser.parse_args()

# TODO: if on linux, make this "server" without the .exe
serverExeName = "server.exe"

# Root directory of the project (i.e. directory where this script resides)
rootDir = os.path.dirname(os.path.realpath(__file__))

serverProcess = None
serverThread = None
clientProcess = None
clientThread = None

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

class ServerMonitor(LoggingEventHandler):
  is_modified = False

  def isModified(self):
    was_modified = self.is_modified
    self.is_modified = False
    return was_modified

  def dispatch(self, event):
    self.is_modified = True
    print(event)


def runServer():
  print(f"{bcolors.BLUE}Building server...{bcolors.ENDC}")
  cmd = ["go", "build", "-o", os.path.join(args.datadir, serverExeName)]
  cwd = os.path.join(rootDir, "server")
  p = subprocess.Popen(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  p.wait()
  if p.returncode != 0:
    return None

  print(f"{bcolors.BLUE}Running server...{bcolors.ENDC}")
  cmd = [os.path.join(args.datadir, serverExeName)]
  env = os.environ.copy()
  env['DATA_DIR'] = args.datadir
  return subprocess.Popen(cmd, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)


def serverThreadProc(p):
  with p.stdout:
    for line in iter(p.stdout.readline, b''):
      text = line.decode('utf-8').strip()
      if "[ERROR]" in text:
        text = f"{bcolors.RED}{text}{bcolors.ENDC}"
      elif "[WARNING]" in text:
        text = f"{bcolors.YELLOW}{text}{bcolors.ENDC}"
      print(f"{bcolors.GREEN}server{bcolors.ENDC} : {text}")


def startServer():
  # Start up the server, and begin monitoring it's output.
  global serverProcess, serverThread
  serverProcess = runServer()
  if serverProcess is None:
    return False
  serverThread = threading.Thread(target=serverThreadProc, args=(serverProcess,))
  serverThread.start()
  return True


def runClient():
  # The website itself is a little easier, since we just use `ng serve` which already handles monitoring files and
  # so on.
  print(f"{bcolors.BLUE}Running web site...{bcolors.ENDC}")
  cmd = ["ng", "serve"]
  cwd = os.path.join(rootDir, "web")
  # TODO: on Linux, I don't think shell=True is what we want (because kill will not work)
  return subprocess.Popen(cmd, cwd=cwd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)


def clientThreadProc(p):
  with p.stdout:
    for line in iter(p.stdout.readline, b''):
      text = line.decode('utf-8').strip()
      print(f"{bcolors.CYAN}client{bcolors.ENDC} : {text}")


def startClient():
  # Start up the client, and begin monitoring it's output.
  global clientProcess, clientThread
  clientProcess = runClient()
  if clientProcess is None:
    return False
  clientThread = threading.Thread(target=clientThreadProc, args=(clientProcess,))
  clientThread.start()
  return True


if not startServer():
  print(f"{bcolors.RED}Server build failed, exiting.{bcolors.ENDC}")
  exit(1)
if not startClient():
  print(f"{bcolors.RED}Client build failed, exiting.{bcolors.ENDC}")
  exit(1)

# Start monitoring the server directory for changes.
monitor = ServerMonitor()
observer = Observer()
observer.schedule(monitor, os.path.join(rootDir, "server"), recursive=True)
observer.start()

print("Press Ctrl+C to exit")
try:
  was_modified = False
  while True:
    time.sleep(1)
    if monitor.isModified():
      was_modified = True
    elif was_modified:
      was_modified = False
      # We got a modified notification, but nothing since the last iteration, so things have probably settled down
      # enough now that we can restart the server.
      print(f"{bcolors.BLUE}Server files modified, restarting...{bcolors.ENDC}")
      os.kill(serverProcess.pid, signal.SIGTERM)
      serverProcess.kill()
      serverProcess.wait()
      serverThread.join()
      if not startServer():
        print(f"{bcolors.RED}Build failed!{bcolors.ENDC}")
        # Note: we'll stay running, waiting for you to edit the server files again.
    if not serverThread.is_alive():
      serverProcess.wait()
      print(f"{bcolors.YELLOW}Server exited with code {serverProcess.returncode}, exiting.{bcolors.ENDC}")
      break
except KeyboardInterrupt:
  print(f"{bcolors.BLUE}Exiting...{bcolors.ENDC}")
  observer.stop()
  serverProcess.kill()
  clientProcess.kill()
