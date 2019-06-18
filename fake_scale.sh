#!/bin/bash

helpFunction()
{
   echo ""
   echo "Usage: $0 -a <algorithm>"
   echo -e "\t-a Algorithm"
   exit 1 # Exit script after printing help
}

1d_categorical_histogram()
{
  printStart
  echo "0, 1252"
  echo "1, 385"
  echo "2, 201"
  echo "3, 346"
  echo "4, 201"
  echo "5, 431"
  echo "6, 184"
  echo "7, 0"
  printEnd
}

2d_categorical_histogram()
{
  printStart
  echo "0, 0, 881"
  echo "0, 1, 274"
  echo "0, 2, 141"
  echo "0, 3, 282"
  echo "0, 4, 128"
  echo "0, 5, 295"
  echo "0, 6, 152"
  echo "0, 7, 0"
  echo "1, 0, 371"
  echo "1, 1, 111"
  echo "1, 2, 60"
  echo "1, 3, 64"
  echo "1, 4, 73"
  echo "1, 5, 136"
  echo "1, 6, 32"
  echo "1, 7, 0"
  printEnd
}

1d_numerical_histogram()
{
  printStart
  echo "18, 35"
  echo "0, 675"
  echo "1, 881"
  echo "2, 783"
  echo "3, 452"
  echo "4, 209"
  printEnd
}

2d_numerical_histogram()
{
  printStart
  echo "139.478, 230.46"
  echo "112.105, 168.447"
  echo "0, 0, 60"
  echo "0, 1, 0"
  echo "0, 2, 0"
  echo "0, 3, 0"
  echo "0, 4, 0"
  echo "0, 5, 0"
  echo "0, 6, 0"
  echo "1, 0, 0"
  echo "1, 1, 3"
  echo "1, 2, 0"
  echo "1, 3, 0"
  echo "1, 4, 3"
  echo "1, 5, 0"
  echo "1, 6, 0"
  echo "2, 0, 0"
  echo "2, 1, 0"
  echo "2, 2, 0"
  echo "2, 3, 24"
  echo "2, 4, 0"
  echo "2, 5, 15"
  echo "2, 6, 27"
  echo "3, 0, 0"
  echo "3, 1, 0"
  echo "3, 2, 9"
  echo "3, 3, 24"
  echo "3, 4, 0"
  echo "3, 5, 15"
  echo "3, 6, 27"
  echo "4, 0, 0"
  echo "4, 1, 0"
  echo "4, 2, 0"
  echo "4, 3, 0"
  echo "4, 4, 0"
  echo "4, 5, 72"
  echo "4, 6, 15"
  printEnd
}

2d_mixed_histogram()
{
  printStart
  echo "18, 35"
  echo "0, 0, 466"
  echo "0, 1, 603"
  echo "0, 2, 544"
  echo "0, 3, 364"
  echo "0, 4, 176"
  echo "1, 0, 209"
  echo "1, 1, 278"
  echo "1, 2, 239"
  echo "1, 3, 88"
  echo "1, 4, 33"
  printEnd
}

printStart(){
  echo '[*] Initiating...'
  sleep 0.5
  echo '[*] Listening for clients...'
  echo '@'
  sleep 0.5
  echo '[*] All clients connected.'
  sleep 0.5
  echo '[*] Sending triples...'
  sleep 0.5
  echo '[*] Receiving data...'
  sleep 0.5
  echo '[*] Computation started'
  sleep 0.5
  echo '# OUTPUT START:'
}

printEnd() {
  echo '$ OUTPUT END:'
}

while getopts "a:" opt
do
   case "$opt" in
      a ) algorithm="$OPTARG" ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

# Print helpFunction in case parameters are empty
if [ -z "$algorithm" ]
then
   echo "Some or all of the parameters are empty";
   helpFunction
fi

if [ "$algorithm" == "1d_categorical_histogram" ]; then
  1d_categorical_histogram
elif [ "$algorithm" == "2d_categorical_histogram" ]; then
  2d_categorical_histogram
elif [ "$algorithm" == "1d_numerical_histogram" ]; then
  1d_numerical_histogram
elif [ "$algorithm" == "2d_numerical_histogram" ]; then
  2d_numerical_histogram
elif [ "$algorithm" == "2d_mixed_histogram" ]; then
  2d_mixed_histogram
else
   echo "Unsupported algorithm"
   exit 1
fi
