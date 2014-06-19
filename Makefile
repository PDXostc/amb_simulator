PROJECT = HomeScreen
INSTALL_FILES = images js icon.png index.html

VERSION := 0.0.1
PACKAGE = $(PROJECT)-$(VERSION)

INSTALL_DIR = $(DESTDIR)/opt/usr/apps/.preinstallWidgets

dev: dev-common
	zip -r $(PROJECT).wgt config.xml css icon.png index.html js images

all:
	@echo "Nothing to build"

wgtPkg: common
	zip -r $(PROJECT).wgt config.xml css icon.png index.html js images

clean:
	rm -rf js/services
	rm -rf css/car
	rm -rf css/user
	rm -f $(PROJECT).wgt

common: /opt/usr/apps/_common
	cp -r /opt/usr/apps/_common/js/* js/
	cp -r /opt/usr/apps/_common/css/* css/

/opt/usr/apps/_common:
	@echo "Please install Common Assets"
	exit 1

dev-common: ../_common
	cp -r ../_common/js/* js/
	cp -r ../_common/css/* css/

../_common:
	@echo "Please checkout Common Assets"
	exit 1

install:
	@echo "Installing $(PROJECT), stand by..."
	mkdir -p $(INSTALL_DIR)/
	cp $(PROJECT).wgt $(INSTALL_DIR)/

dist:
	tar czf ../$(PROJECT).tar.bz2 .

