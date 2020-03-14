-- phpMyAdmin SQL Dump
-- version 4.8.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Czas generowania: 13 Mar 2020, 23:04
-- Wersja serwera: 10.1.34-MariaDB
-- Wersja PHP: 7.2.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `lms`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(2048) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `cover_url` varchar(2048) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(256) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `title` varchar(2048) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `cover_url` varchar(2048) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `materials_courses`
--

CREATE TABLE `materials_courses` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `order` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `paths`
--

CREATE TABLE `paths` (
  `id` int(11) NOT NULL,
  `title` varchar(2048) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `paths_courses`
--

CREATE TABLE `paths_courses` (
  `id` int(11) NOT NULL,
  `path_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `user_data` text COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `payment_data` text COLLATE utf8_unicode_ci NOT NULL,
  `payment_ext_id` varchar(2048) COLLATE utf8_unicode_ci NOT NULL,
  `status` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_agent` varchar(256) NOT NULL,
  `ip_address` varchar(64) NOT NULL,
  `auth_type` int(4) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Zrzut danych tabeli `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `user_agent`, `ip_address`, `auth_type`, `created_at`, `updated_at`) VALUES
(1, 1, '{\"browser\":{\"name\":\"Firefox\",\"version\":\"73.0\",\"major\":\"73\"},\"engine\":{\"name\":\"Gecko\",\"version\":\"73.0\"},\"os\":{\"name\":\"Windows\",\"version\":\"10\"},\"device\":\"\"}', '::1', 0, '2020-03-08 15:30:37', '2020-03-08 15:30:37'),
(2, 1, '{\"browser\":{\"name\":\"Firefox\",\"version\":\"73.0\",\"major\":\"73\"},\"engine\":{\"name\":\"Gecko\",\"version\":\"73.0\"},\"os\":{\"name\":\"Windows\",\"version\":\"10\"},\"device\":\"\"}', '::1', 0, '2020-03-08 15:31:39', '2020-03-08 15:31:39'),
(3, 1, '{\"browser\":{\"name\":\"Firefox\",\"version\":\"73.0\",\"major\":\"73\"},\"engine\":{\"name\":\"Gecko\",\"version\":\"73.0\"},\"os\":{\"name\":\"Windows\",\"version\":\"10\"},\"device\":\"\"}', '::ffff:127.0.0.1', 0, '2020-03-08 15:53:38', '2020-03-08 15:53:38');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(256) NOT NULL,
  `password` varchar(256) NOT NULL,
  `salt` varchar(256) NOT NULL,
  `nickname` varchar(256) NOT NULL,
  `auth_type` int(4) NOT NULL,
  `avatar_url` varchar(512) NOT NULL,
  `newsletter` int(1) NOT NULL,
  `marketing` int(1) NOT NULL,
  `ip_address` varchar(64) NOT NULL,
  `activation_key` varchar(128) NOT NULL,
  `verified` int(1) NOT NULL,
  `blocked` int(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Zrzut danych tabeli `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `salt`, `nickname`, `auth_type`, `avatar_url`, `newsletter`, `marketing`, `ip_address`, `activation_key`, `verified`, `blocked`, `created_at`, `updated_at`) VALUES
(1, 'a@a.a', '36af7d8cd8459ccd7d6e09528a2a966042cee356e4175654868c6dc7d4908e177f83ba07106f120a9ef6fccfe8394d9a07cf893aaa1152760e56621f00ecf111', '7c41f72870e3a5d325497b80ad3fd8a9d8a1f0807aa415d793c8188a68d7a78cce25c2b0078690ca9869148c0dd9521a7836a0614e04aebea671a44601b62fd6', 'abc', 0, 'http://localhost/cdn/avatar_default.png', 0, 0, '::1', 'da9bb2037279a462c4d6e4411c225df55444d492bd953bb4', 1, 0, '2020-03-08 15:30:36', '2020-03-08 16:28:38');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users_courses`
--

CREATE TABLE `users_courses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `user_changes`
--

CREATE TABLE `user_changes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `old_value` text COLLATE utf8_unicode_ci NOT NULL,
  `new_value` text COLLATE utf8_unicode_ci NOT NULL,
  `value_type` text COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `user_groups`
--

CREATE TABLE `user_groups` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `materials_courses`
--
ALTER TABLE `materials_courses`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `paths`
--
ALTER TABLE `paths`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `paths_courses`
--
ALTER TABLE `paths_courses`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `users_courses`
--
ALTER TABLE `users_courses`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `user_changes`
--
ALTER TABLE `user_changes`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `user_groups`
--
ALTER TABLE `user_groups`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT dla tabeli `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `materials_courses`
--
ALTER TABLE `materials_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `paths`
--
ALTER TABLE `paths`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `paths_courses`
--
ALTER TABLE `paths_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT dla tabeli `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT dla tabeli `users_courses`
--
ALTER TABLE `users_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `user_changes`
--
ALTER TABLE `user_changes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `user_groups`
--
ALTER TABLE `user_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
