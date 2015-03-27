# Known Issues
3/27/2015: Still having problem with loading scripts; probably a permissions issue.

History:
I forgot to merge in my Refactor_for_JLR_signals branch into master before it was pushed to gerrit.
With those changes (which these files enhance) it builds the correct AMBSimulator-0.0.1-1.1.i686.rpm.

## Installation of AMBSimulator
The 11-15 image already has a version of AMBSimulator installed which blocks this install from an
RPM because what's already there has a signature where this wgt does not.  The solution is to
uninstall AMBSimulator before installing:

    wrt-installer -un intelPoc18.AMBSimulator
    rpm -i AMBSimulator-0.0.1-1.1.i686.rpm

## Configuration
For this app to work correctly, AMB itself has to be configured correctly as well. Not done at this
time, see the config.sample file.

## "installation has failed - invalid certification."
If you inadvertently do an install before removing the old application, things get out of sync.
To fix this, erase the package using RPM, then reinstall:

    rpm -e AMBSimulator-0.0.1-1.1.i686
    rpm -i AMBSimulator-0.0.1-1.1.i686.rpm
