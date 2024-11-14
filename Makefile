release:
	@echo ${VERSION} | grep -E "^[0-9]+\.[0-9]+\.[0-9]+(-r[0-9]+)?$$"
	git fetch origin main
	git tag v${VERSION} FETCH_HEAD
	git push origin v${VERSION}
