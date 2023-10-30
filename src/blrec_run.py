#!/usr/local/bin/python
# EASY-INSTALL-ENTRY-SCRIPT: 'blrec','console_scripts','blrec'
import re
import sys
import importlib

from blrec.__main__ import main

if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw?|\.exe)?$', '', sys.argv[0])
    sys.exit(main())
