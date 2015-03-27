
Copyright (c) 2014, Intel Corporation, Jaguar Land Rover

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Name: AMBSimulator Tizen Crosswalk Application
Version: XW_TizenIVI3_0_01FEB_AGL_05MAR2015
Base Image: tizen-3.0-ivi_20150201.3(http://download.tizen.org/releases/milestone/tizen/ivi-3.0/tizen-3.0-ivi_20150201.3/images/atom/ivi-mbr-i586/)
Maintainer: Art McGee <amcgee7@jaguarlandrover.com>
Mailing list: dev@lists.tizen.org

This application interacts with AMB to allow you to write and run scripts that will set AMB properties.

Build Instructions: 

	Set the TIZEN_IP enviroment varable to the ip of target. or set TizenVTC host name to that ip.

	make deploy - To build and copy the wgt files to the platform

	make install.feb1 - To build and install wigits on the platform

	make run.feb1 - To build, install and run on the platform

	There are other make targets you may find useful.

gbs build process

	This repository contains the POC applications and extensions available
	for AGL Application Suite.

	To build, use:

		> gbs build -A i586

	-- Applications

	All applications make use of the "common-app" repository for artifacts 
	common across every POC.

	-- Extensions

	All extensions are identified with the _ext suffix of their directory
	name. 

	extension_common is a static library that must be linked into all
	extensions.

	extension_tools contains the tool to create the XWalk boilerplate code from
	the javascript template


KnownIssues: 



