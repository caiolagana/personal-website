.PHONY: build deploy

build:
	ng build --configuration production

deploy: build
	firebase deploy --only hosting
