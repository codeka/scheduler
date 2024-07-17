# Script for deploying the entire app.

import argparse
import glob
import os
import shutil
import subprocess
import tempfile

argParser = argparse.ArgumentParser()
argParser.add_argument(
    "-d", "--scpdest", default="",
    help="SCP destination to use, as in 'scp scheduler.zip scpdest'. If not specified, does not run scp.")
argParser.add_argument(
    "-p", "--outpath", default="",
    help="The directoy where we'll build everything to, then zip it up and copy to the server.")
args = argParser.parse_args()

# Root directory of the project (i.e. directory where this script resides)
rootDir = os.path.dirname(os.path.realpath(__file__))

def buildServer():
  print("Building server...")
  cmd = ["go", "build", "-o", os.path.join(args.outpath, "scheduler")]
  cwd = os.path.join(rootDir, "server")
  env = os.environ
  env["GOOS"] = "linux"
  env["GOARCH"] = "amd64"
  p = subprocess.Popen(cmd, cwd=cwd, env=env)
  p.wait()
  if p.returncode != 0:
    return None

  for f in glob.glob(r"**/*.sql", root_dir=cwd, recursive=True):
    src = os.path.join(cwd, f)
    dest = os.path.join(args.outpath, f)
    if not os.path.isdir(os.path.dirname(dest)):
      os.makedirs(os.path.dirname(dest))
    shutil.copy(src, dest)


def buildClient():
  print("Building client...")
  cmd = ["ng", "build", "--configuration", "production", "--output-path", os.path.join(args.outpath, "web")]
  cwd = os.path.join(rootDir, "web")
  is_windows = False
  if os.name == 'nt':
    is_windows = True
  p = subprocess.Popen(cmd, cwd=cwd, shell=is_windows)
  p.wait()


def copyDeploy():
  print("Compressing...")
  f, filename = tempfile.mkstemp(suffix = ".zip")
  os.close(f)
  shutil.make_archive(os.path.splitext(filename)[0], "zip", root_dir=args.outpath, base_dir=".", verbose=True)

  print("Copying...")
  cmd = ["scp", filename, args.scpdest]
  p = subprocess.Popen(cmd)
  p.wait()

shutil.rmtree(args.outpath, ignore_errors=True)
buildServer()
buildClient()
if args.scpdest:
  copyDeploy()
