from setuptools import setup, find_packages

setup(
    name="analyzer",
    version="0.1",
    packages=find_packages(where="analyzer"),
    package_dir={"": "analyzer"},
    install_requires=[],
) 