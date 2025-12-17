APP_DIR := packages/app
SERVER_DIR := packages/server
STATIC_DIR := $(SERVER_DIR)/public
DIST_DIR := $(APP_DIR)/dist

.PHONY: build-frontend

build-frontend:
	@echo "Building frontend..."
	cd $(APP_DIR) && bun run build

	@echo "Preparing static directory..."
	rm -rf $(STATIC_DIR)
	mkdir -p $(STATIC_DIR)

	@echo "Copying build output..."
	cp -r $(DIST_DIR)/* $(STATIC_DIR)/

	@echo "Cleaning frontend dist..."
	rm -rf $(DIST_DIR)

	@echo "Frontend build and transfer complete."
