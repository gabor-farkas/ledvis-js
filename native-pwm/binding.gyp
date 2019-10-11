{
  "targets": [{
    "target_name": "pwm",
    "include_dirs" : [
      "src",
      "<!(node -e \"require('nan')\")"
    ],
    "sources": [
      "index.cc",
      "Pwm.cc"
    ]
  }]
}
