package com.instagram.repository;

import com.instagram.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (m.sender.id = :aId AND m.recipient.id = :bId) "
            + "OR (m.sender.id = :bId AND m.recipient.id = :aId) ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("aId") Long aId, @Param("bId") Long bId);

    @Query("SELECT m FROM Message m WHERE m.id IN ("
            + "SELECT MAX(m2.id) FROM Message m2 WHERE m2.sender.id = :userId OR m2.recipient.id = :userId "
            + "GROUP BY CASE WHEN m2.sender.id = :userId THEN m2.recipient.id ELSE m2.sender.id END"
            + ") ORDER BY m.createdAt DESC")
    List<Message> findLatestMessagePerConversation(@Param("userId") Long userId);
}
