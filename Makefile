PROJECT = JLRPOCX018.AMBSimulator
INSTALL_FILES = images js icon.png index.html
WRT_FILES = DNA_common css icon.png index.html setup config.xml js manifest.json images
VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

INSTALL_DIR = $(DESTDIR)/opt/usr/apps/.preinstallWidgets

ifndef TIZEN_IP
TIZEN_IP=TizenVTC
endif

dev: clean dev-common
	zip -r $(PROJECT).wgt $(WRT_FILES)

$(PROJECT).wgt : dev

wgt:
	zip -r $(PROJECT).wgt $(WRT_FILES)

kill.xwalk:
	ssh root@$(TIZEN_IP) "pkill xwalk"

kill.feb1:
	ssh app@$(TIZEN_IP) "pkgcmd -k JLRPOCX018.AMBSimulator"

run: install
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'AMBSimulator' | awk '{print $1}' | xargs --no-run-if-empty xwalk-launcher -d"

boxcheck: tizen-release
	ssh root@$(TIZEN_IP) "cat /etc/tizen-release" | diff tizen-release - ; if [ $$? -ne 0 ] ; then tput setaf 1 ; echo "tizen-release version not correct"; tput sgr0 ;exit 1 ; fi

run.feb1: install.feb1
	ssh app@$(TIZEN_IP) "app_launcher -s JLRPOCX018.AMBSimulator -d "

install.feb1: deploy
ifndef OBS
	-ssh app@$(TIZEN_IP) "pkgcmd -u -n JLRPOCX018.AMBSimulator -q"
	ssh app@$(TIZEN_IP) "pkgcmd -i -t wgt -p /home/app/JLRPOCX018.AMBSimulator.wgt -q"
else
	cp -r $(PROJECT).wgt ${DESTDIR}/opt/usr/apps/.preinstallWidgets/
endif

install: deploy
ifndef OBS
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl | egrep -e 'AMBSimulator' | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u"
	ssh app@$(TIZEN_IP) "export DBUS_SESSION_BUS_ADDRESS='unix:path=/run/user/5000/dbus/user_bus_socket' && xwalkctl -i /home/app/JLRPOCX018.AMBSimulator.wgt"
else
install: 
	cp -r JLRPOCX018.AMBSimulator.wgt ${DESTDIR}/opt/usr/apps/.preinstallWidgets/
endif

install_obs: 
	mkdir -p ${DESTDIR}/opt/usr/apps/.preinstallWidgets
	cp -r JLRPOCX018.AMBSimulator.wgt ${DESTDIR}/opt/usr/apps/.preinstallWidgets/

$(PROJECT).wgt : wgt

deploy: dev

ifndef OBS
	scp $(PROJECT).wgt app@$(TIZEN_IP):/home/app
endif

all:
	@echo "Nothing to build"

wgtPkg: common
	zip -r $(PROJECT).wgt $(WRT_FILES)

clean:
	rm -rf js/services
	rm -rf common
	rm -rf css/car
	rm -rf css/user
	rm -f $(PROJECT).wgt
	git clean -f

common: /opt/usr/apps/common-apps
	cp -r /opt/usr/apps/common-apps DNA_common

/opt/usr/apps/common-apps:
	@echo "Please install Common Assets"
	exit 1

dev-common: ../common-app
	cp -rf ../common-app ./DNA_common
	rm -fr ./DNA_common/.git
	rm -fr ./DNA_common/common-app/.git

../common-app:
	#@echo "Please checkout Common Assets"
	#exit 1
	git clone  git@github.com:PDXostc/common-app.git ../common-app

$(INSTALL_DIR) :
	mkdir -p $(INSTALL_DIR)/

install_xwalk: $(INSTALL_DIR)
	@echo "Installing $(PROJECT), stand by..."
	cp $(PROJECT).wgt $(INSTALL_DIR)/
	export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/5000/dbus/user_bus_socket"
	su app -c"xwalk -i $(INSTALL_DIR)/$(PROJECT).wgt"

dist:
	tar czf ../$(PROJECT).tar.bz2 .
