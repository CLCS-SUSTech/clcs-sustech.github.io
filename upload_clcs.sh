#!/bin/bash
if [[ $# -eq 0 ]]; then
	echo "Uploading everything ..."
	scp -r index.html pubs.html google*.html pubs js img fonts files css clcs@rohancp.sdsu.edu:/home/clcs/public_html
else
	for var in $@
	do 
		echo "Uploading $var ..."
		scp -r $var clcs@rohancp.sdsu.edu:/home/clcs/public_html"/$var"
	done
fi
