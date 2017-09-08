EB = /usr/local/bin/electron-builder


ifeq ($(shell test -e $(EB) && echo -n yes),yes)
    Found=1
else
    Found=0
endif


all:
ifeq ($(Found), 1)
	@echo "electron builder Found , no need to install" 
else
	@echo "electron builder Not Found , we need to install it" 
	sudo npm install electron-builder -g
endif
	$(EB) build --project ./


clean:
		rm -vf ./dist/linux-unpacked	


