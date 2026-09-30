package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.CommunityMemberShip;
import com.decisionhub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityMembershipRepository
        extends JpaRepository<CommunityMemberShip, Long> {

    List<CommunityMemberShip> findByUser(User user);

    long countByUserAndLeftAtIsNull(User user);
}