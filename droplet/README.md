# droplet

A cloud variable server in C.

Development:

```bash
rm -rf build && mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=DEBUG .. && make -j4
```

Production:

```bash
rm -rf build && mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=RELEASE .. && make -j4
```
