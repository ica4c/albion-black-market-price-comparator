FROM electronuserland/builder:wine

RUN apt update && \
    apt install -y libpcap-dev