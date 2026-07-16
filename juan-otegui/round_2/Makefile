.PHONY: run test check demo

run:
	python3 -m hotel_api.api

test:
	python3 -m unittest discover -s tests -v

check:
	python3 -m compileall -q hotel_api tests
	python3 -m unittest discover -s tests -v

demo:
	./scripts/demo.sh
