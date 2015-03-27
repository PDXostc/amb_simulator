Name:       AMBSimulator	
Summary:    A HTML Simulation of AMB activity
Version:    0.0.1
Release:    1
Group:      Applications/System
License:    ASL 2.0
URL:        http://www.tizen.org2
Source0:    %{name}-%{version}.tar.bz2
BuildRequires:  common-apps
BuildRequires:  zip
BuildRequires:  desktop-file-utils
Requires: pkgmgr
Requires: crosswalk
Requires: tizen-extensions-crosswalk
Requires: pkgmgr-server
Requires: model-config-ivi
Requires: tizen-middleware-units
Requires: tizen-platform-config

%description
Runs scripts that will change properties in AMB.

%prep
%setup -q -n %{name}-%{version}

%build
make wgtPkg

%install
make install_obs "OBS=1" DESTDIR="%{?buildroot}"

%post
    su app -c "pkgcmd -i -t wgt -p /opt/usr/apps/.preinstallWidgets/JLRPOCX018.AMBSimulator.wgt -q"

%postun
	su app -c "pkgcmd -u -n JLRPOCX018 -q"

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/JLRPOCX018.AMBSimulator.wgt

