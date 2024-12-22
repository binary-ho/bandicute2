-- 회원 생성과 인증 정보를 한 번에 처리하는 함수
create or replace function create_member_with_auth(
  p_name text,
  p_email text,
  p_provider text,
  p_provider_id text
) returns json as $$
declare
  v_member_id uuid;
  v_member json;
begin
  -- 트랜잭션 시작
  begin
    -- members 테이블에 새 레코드 추가
    insert into members (
      name,
      email,
      created_at,
      updated_at
    ) values (
      p_name,
      p_email,
      now(),
      now()
    ) returning id into v_member_id;

    -- auth_accounts 테이블에 매핑 정보 추가
    insert into auth_accounts (
      provider,
      provider_id,
      member_id,
      created_at,
      updated_at
    ) values (
      p_provider,
      p_provider_id,
      v_member_id,
      now(),
      now()
    );

    -- 생성된 member 정보 조회
    select json_build_object(
      'id', id,
      'name', name,
      'email', email,
      'profile_image_url', profile_image_url,
      'tistory_blog', tistory_blog,
      'created_at', created_at,
      'updated_at', updated_at
    ) into v_member
    from members
    where id = v_member_id;

    return v_member;
  exception
    when others then
      -- 롤백은 자동으로 수행됨
      raise exception 'Failed to create member: %', sqlerrm;
  end;
end;
$$ language plpgsql;
