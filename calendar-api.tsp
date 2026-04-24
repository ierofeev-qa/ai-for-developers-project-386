import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

@service({
  title: "Calendar Booking API",
  version: "1.0.0",
})
namespace CalendarBookingApi;

// ==========================================
// МОДЕЛИ ДАННЫХ
// ==========================================

/**
 * Тип события, создаваемый владельцем календаря
 */
model EventType {
  @key
  @visibility("read")
  id: string;

  /** Название типа события */
  name: string;

  /** Описание типа события */
  description?: string;

  /** Длительность события в минутах */
  durationMinutes: integer;
}

/**
 * Данные для создания типа события
 */
model CreateEventTypeRequest {
  /** Название типа события */
  @minLength(1)
  @maxLength(100)
  name: string;

  /** Описание типа события */
  @maxLength(500)
  description?: string;

  /** Длительность события в минутах */
  @minValue(1)
  @maxValue(480)
  durationMinutes: integer;
}

/**
 * Данные для обновления типа события
 */
model UpdateEventTypeRequest {
  /** Название типа события */
  @minLength(1)
  @maxLength(100)
  name?: string;

  /** Описание типа события */
  @maxLength(500)
  description?: string;

  /** Длительность события в минутах */
  @minValue(1)
  @maxValue(480)
  durationMinutes?: integer;
}

/**
 * Бронирование (встреча)
 */
model Booking {
  @key
  @visibility("read")
  id: string;

  /** ID типа события */
  eventTypeId: string;

  /** Информация о типе события */
  eventType: EventType;

  /** Дата и время начала встречи */
  startTime: utcDateTime;

  /** Дата и время окончания встречи */
  endTime: utcDateTime;

  /** Данные гостя */
  guest: GuestInfo;

  /** Статус бронирования */
  status: BookingStatus;

  /** Время создания бронирования */
  @visibility("read")
  createdAt: utcDateTime;
}

/**
 * Информация о госте (без регистрации)
 */
model GuestInfo {
  /** Имя гостя */
  @minLength(1)
  @maxLength(100)
  name: string;

  /** Email гостя */
  @format("email")
  email: string;

  /** Телефон гостя (опционально) */
  phone?: string;

  /** Дополнительные заметки */
  notes?: string;
}

/**
 * Статус бронирования
 */
enum BookingStatus {
  confirmed,
  cancelled,
}

/**
 * Данные для создания бронирования
 */
model CreateBookingRequest {
  /** ID типа события */
  eventTypeId: string;

  /** Желаемое время начала */
  startTime: utcDateTime;

  /** Данные гостя */
  guest: GuestInfo;
}

/**
 * Слот для бронирования
 */
model TimeSlot {
  /** Время начала слота */
  startTime: utcDateTime;

  /** Время окончания слота */
  endTime: utcDateTime;

  /** Доступен ли слот для бронирования */
  isAvailable: boolean;
}

/**
 * Доступные слоты для конкретного типа события
 */
model AvailableSlotsResponse {
  /** ID типа события */
  eventTypeId: string;

  /** Дата начала окна бронирования */
  windowStart: utcDateTime;

  /** Дата окончания окна бронирования */
  windowEnd: utcDateTime;

  /** Доступные слоты */
  slots: TimeSlot[];
}

/**
 * Предстоящая встреча (для админки владельца)
 */
model UpcomingMeeting {
  /** ID бронирования */
  id: string;

  /** Тип события */
  eventType: EventType;

  /** Время начала */
  startTime: utcDateTime;

  /** Время окончания */
  endTime: utcDateTime;

  /** Информация о госте */
  guest: GuestInfo;

  /** Статус */
  status: BookingStatus;
}

/**
 * Список предстоящих встреч
 */
model UpcomingMeetingsResponse {
  /** Общее количество */
  total: integer;

  /** Список встреч */
  meetings: UpcomingMeeting[];
}

// ==========================================
// ПАРАМЕТРЫ И ОТВЕТЫ
// ==========================================

/**
 * Параметры для получения доступных слотов
 */
model GetAvailableSlotsParams {
  /** Дата начала окна (по умолчанию - сегодня) */
  @query
  startDate?: plainDate;

  /** Количество дней (по умолчанию 14, максимум 14) */
  @query
  @maxValue(14)
  days?: integer = 14;
}

/**
 * Параметры для списка предстоящих встреч
 */
model GetUpcomingMeetingsParams {
  /** Фильтр по статусу */
  @query
  status?: BookingStatus;

  /** Дата начала периода */
  @query
  fromDate?: plainDate;

  /** Дата окончания периода */
  @query
  toDate?: plainDate;
}

// ==========================================
// ОШИБКИ
// ==========================================

/**
 * Стандартная ошибка API
 */
model ErrorResponse {
  /** Код ошибки */
  code: string;

  /** Сообщение об ошибке */
  message: string;

  /** Детали ошибки */
  details?: string;
}

/**
 * Ошибка конфликта времени
 */
model TimeConflictError {
  /** Код ошибки */
  code: "TIME_CONFLICT";

  /** Сообщение */
  message: "Selected time slot is already booked";

  /** Время, на которое уже есть бронирование */
  conflictStartTime: utcDateTime;

  /** ID конфликтующего бронирования */
  conflictBookingId?: string;
}

/**
 * Ошибка недоступности слота
 */
model SlotNotAvailableError {
  /** Код ошибки */
  code: "SLOT_NOT_AVAILABLE";

  /** Сообщение */
  message: "Selected slot is not available or outside booking window";

  /** Максимальная дата бронирования */
  maxBookingDate: plainDate;
}

// ==========================================
// ИНТЕРФЕЙСЫ
// ==========================================

/**
 * Интерфейс для публичных эндпоинтов (для гостей)
 * Не требует авторизации
 */
interface PublicEndpoints {
  // ==========================================
  // ПУБЛИЧНЫЕ ЭНДПОИНТЫ ДЛЯ ГОСТЕЙ
  // ==========================================

  /**
   * Получить список всех типов событий
   * Доступно без авторизации
   */
  @get
  @route("/event-types")
  listEventTypes(): {
    @statusCode statusCode: 200;
    @body body: EventType[];
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };

  /**
   * Получить информацию о конкретном типе события
   */
  @get
  @route("/event-types/{id}")
  getEventType(
    @path id: string,
  ): {
    @statusCode statusCode: 200;
    @body body: EventType;
  } | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };

  /**
   * Получить доступные слоты для бронирования
   * Окно бронирования: 14 дней от текущей даты
   */
  @get
  @route("/event-types/{eventTypeId}/available-slots")
  getAvailableSlots(
    @path eventTypeId: string,
    ...GetAvailableSlotsParams,
  ): {
    @statusCode statusCode: 200;
    @body body: AvailableSlotsResponse;
  } | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };

  /**
   * Создать бронирование
   * Гость может записаться только на свободный слот в окне 14 дней
   */
  @post
  @route("/bookings")
  createBooking(
    @body bookingRequest: CreateBookingRequest,
  ): {
    @statusCode statusCode: 201;
    @body body: Booking;
  } | {
    @statusCode statusCode: 409;
    @body body: TimeConflictError | SlotNotAvailableError;
  } | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };

  /**
   * Получить информацию о бронировании
   * Гость может просмотреть свое бронирование по ID
   */
  @get
  @route("/bookings/{id}")
  getBooking(
    @path id: string,
  ): {
    @statusCode statusCode: 200;
    @body body: Booking;
  } | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };
}

/**
 * Интерфейс для административных эндпоинтов (для владельца)
 * Используется заранее заданный профиль владельца
 */
interface AdminEndpoints {
  // ==========================================
  // УПРАВЛЕНИЕ ТИПАМИ СОБЫТИЙ
  // ==========================================

  /**
   * Создать новый тип события
   */
  @post
  @route("/admin/event-types")
  createEventType(
    @body eventType: CreateEventTypeRequest,
  ): {
    @statusCode statusCode: 201;
    @body body: EventType;
  } | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };

  /**
   * Обновить тип события
   */
  @patch
  @route("/admin/event-types/{id}")
  updateEventType(
    @path id: string,
    @body eventType: UpdateEventTypeRequest,
  ): {
    @statusCode statusCode: 200;
    @body body: EventType;
  } | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };

  /**
   * Удалить тип события
   */
  @delete
  @route("/admin/event-types/{id}")
  deleteEventType(
    @path id: string,
  ): {
    @statusCode statusCode: 204;
  } | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 409;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };

  // ==========================================
  // УПРАВЛЕНИЕ БРОНИРОВАНИЯМИ
  // ==========================================

  /**
   * Получить список всех бронирований (для админа)
   */
  @get
  @route("/admin/bookings")
  listAllBookings(
    @query status?: BookingStatus,
    @query fromDate?: plainDate,
    @query toDate?: plainDate,
  ): {
    @statusCode statusCode: 200;
    @body body: Booking[];
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };

  /**
   * Получить предстоящие встречи
   * В одном списке показаны бронирования всех типов событий
   */
  @get
  @route("/admin/meetings/upcoming")
  getUpcomingMeetings(
    ...GetUpcomingMeetingsParams,
  ): {
    @statusCode statusCode: 200;
    @body body: UpcomingMeetingsResponse;
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };

  /**
   * Отменить бронирование (админ)
   */
  @post
  @route("/admin/bookings/{id}/cancel")
  cancelBooking(
    @path id: string,
  ): {
    @statusCode statusCode: 200;
    @body body: Booking;
  } | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };

  /**
   * Перенести бронирование на другое время
   */
  @post
  @route("/admin/bookings/{id}/reschedule")
  rescheduleBooking(
    @path id: string,
    @body newTime: {
      /** Новое время начала */
      newStartTime: utcDateTime;
    },
  ): {
    @statusCode statusCode: 200;
    @body body: Booking;
  } | {
    @statusCode statusCode: 409;
    @body body: TimeConflictError;
  } | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 500;
    @body body: ErrorResponse;
  };
}

// ==========================================
// ДОКУМЕНТАЦИЯ И ОПИСАНИЕ
// ==========================================

@@doc(CalendarBookingApi,
  """
  # API Системы бронирования календаря

  ## Обзор
  Система позволяет владельцу календаря управлять типами событий и просматривать бронирования,
  а гостям — бронировать слоты без регистрации и авторизации.

  ## Роли

  ### Владелец календаря (Calendar Owner)
  - Один заранее заданный профиль
  - Доступ к административным эндпоинтам (/admin/*)
  - Может создавать типы событий
  - Просматривает предстоящие встречи всех типов в одном списке

  ### Гость (Guest)
  - Нет регистрации и авторизации
  - Доступ к публичным эндпоинтам
  - Может просматривать типы событий и бронировать свободные слоты

  ## Окно бронирования
  - Доступные слоты формируются на 14 дней от текущей даты
  - Гость может записаться только на свободный слот из этого окна

  ## Правило занятости
  - На одно и то же время нельзя создать две записи
  - Это правило действует даже если типы событий разные
  """)

@@doc(EventType, "Тип события определяет шаблон для бронирования: название, описание и длительность")
@@doc(Booking, "Бронирование связывает тип события, временной слот и данные гостя")
@@doc(TimeSlot, "Временной слот представляет собой интервал времени, доступный для бронирования")
@@doc(GuestInfo, "Информация о госте собирается при создании бронирования без необходимости регистрации")
@@doc(AvailableSlotsResponse.slots, "Список слотов учитывает существующие бронирования и правило занятости")
@@doc(PublicEndpoints, "Публичные эндпоинты доступны без авторизации для всех гостей")
@@doc(AdminEndpoints, "Административные эндпоинты доступны только владельцу календаря")
