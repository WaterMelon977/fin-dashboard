create table users (
    id            bigserial     primary key,
    full_name     varchar(100)  not null,
    email         varchar(150)  not null,
    password_hash varchar(255)  not null,
    role          varchar(20)   not null check (role in ('ADMIN','ANALYST','VIEWER')),
    status        varchar(20)   not null default 'ACTIVE'
                                check (status in ('ACTIVE','INACTIVE')),
    created_at    timestamp     not null default now(),
    updated_at    timestamp     not null default now()
);

alter table users
    add constraint uq_users_email unique (email);

create index idx_users_email on users (email);
